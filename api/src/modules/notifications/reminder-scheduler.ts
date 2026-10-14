import { adaptivePlan } from './adaptive-plan';
import { nextDeliveryTime } from './daily-timing';
import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Task } from '@entities/task.entity';
import { Reminder } from '@entities/reminder.entity';
import { NotifChannel, ReminderStatus, TaskStatus } from '@entities/enums';
import { NOTIFICATION_QUEUE } from '../queue/queue.constants';
import { NotificationJobPayload } from './interfaces/notification-job.interface';
import { planReminders } from './reminder-plan';

@Injectable()
export class ReminderScheduler implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  private readonly logger = new Logger(ReminderScheduler.name);
  constructor(
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    @InjectRepository(Reminder)
    private readonly reminders: Repository<Reminder>,
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly queue: Queue<NotificationJobPayload>,
    private readonly config: ConfigService,
  ) {}
  onModuleInit() {
    this.timer = setInterval(() => {
      void this.reconcile().catch((error: unknown) =>
        this.logger.error(
          error instanceof Error
            ? error.message
            : 'Reminder reconciliation failed',
        ),
      );
    }, 15000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async reconcile() {
    if (this.running) return;
    this.running = true;
    try {
      const now = new Date();
      const tasks = await this.tasks.find({
        where: {
          deadline: MoreThan(new Date(now.getTime() - 7 * 86400000)),
          status: In([
            TaskStatus.TODO,
            TaskStatus.IN_PROGRESS,
            TaskStatus.BLOCKED,
          ]),
        },
        relations: { user: { notifChannels: true } },
      });
      const desired = new Set<string>();
      for (const task of tasks) {
        if (task.user.suspendedAt || !task.user.notificationsEnabled) continue;
        const channels = [
          NotifChannel.EMAIL,
          NotifChannel.PUSH,
          NotifChannel.WHATSAPP,
          NotifChannel.SMS,
        ].filter((channel) =>
          task.user.notifChannels.some(
            (p) =>
              p.channel === channel &&
              p.enabled &&
              (channel !== NotifChannel.WHATSAPP ||
                (p.whatsappOptIn && task.user.whatsappNumber)) &&
              (channel !== NotifChannel.SMS || task.user.phoneNumber),
          ),
        );
        const adaptive = task.user.adaptiveEscalationEnabled
          ? adaptivePlan(task, channels, now)
          : [];
        for (const plan of adaptive.length
          ? adaptive
          : planReminders(task, channels, now)) {
          if (
            task.user.remindersResumedAt &&
            plan.triggerAt < task.user.remindersResumedAt
          )
            continue;
          if (
            task.remindersSnoozedUntil &&
            plan.triggerAt <= task.remindersSnoozedUntil
          )
            continue;
          const automaticKey = `${adaptive.length && plan.triggerAt.getTime() > task.deadline.getTime() ? 'adaptive-' : ''}${task.id}-${plan.channel}-${plan.triggerAt.toISOString()}`;
          desired.add(automaticKey);
          await this.reminders
            .createQueryBuilder()
            .insert()
            .values({
              taskId: task.id,
              ...plan,
              automaticKey,
              status: ReminderStatus.PENDING,
            })
            .orIgnore()
            .execute();
          // Re-enable future automatic reminders cancelled while the user paused delivery.
          await this.reminders.update(
            { automaticKey, status: ReminderStatus.CANCELLED },
            {
              status: ReminderStatus.PENDING,
              lastError: null,
            },
          );
        }
      }
      const pending = await this.reminders.find({
        where: { status: ReminderStatus.PENDING },
        relations: { task: { user: true } },
      });
      for (const reminder of pending) {
        // Due reminders remain eligible; a removed/closed task is checked again by the worker.
        const expiredPlan =
          reminder.automaticKey &&
          !reminder.automaticKey.startsWith('fallback-') &&
          !reminder.automaticKey.startsWith('snooze-') &&
          !desired.has(reminder.automaticKey) &&
          reminder.triggerAt > now;
        if (
          !reminder.task ||
          reminder.task.user.suspendedAt ||
          !reminder.task.user.notificationsEnabled ||
          [TaskStatus.DONE, TaskStatus.ARCHIVED].includes(
            reminder.task.status,
          ) ||
          expiredPlan
        ) {
          await this.reminders.update(reminder.id, {
            status: ReminderStatus.CANCELLED,
          });
          const job = await this.queue.getJob(reminder.id);
          if (job && (await job.getState()) !== 'active') await job.remove();
          continue;
        }
        if (!this.config.get<boolean>('notifications.enabled')) continue;
        let adaptiveNotBefore = 0;
        if (
          reminder.automaticKey?.startsWith('adaptive-') &&
          reminder.task.deadline
        ) {
          const offset =
            reminder.triggerAt.getTime() - reminder.task.deadline.getTime();
          if (offset > 0) {
            const previousAt = new Date(
              reminder.task.deadline.getTime() + offset - 3600000,
            );
            const previous = await this.reminders.findOneBy({
              automaticKey: `${offset > 3600000 ? 'adaptive-' : ''}${reminder.taskId}-EMAIL-${previousAt.toISOString()}`,
            });
            if (
              previous &&
              [ReminderStatus.FAILED, ReminderStatus.CANCELLED].includes(
                previous.status,
              )
            ) {
              await this.reminders.update(reminder.id, {
                status: ReminderStatus.CANCELLED,
                lastError: 'Étape précédente non confirmée',
              });
              continue;
            }
            adaptiveNotBefore = previous?.sentAt
              ? previous.sentAt.getTime() + 3600000
              : now.getTime() + 5 * 60000;
          }
        }
        const deliveryAt = nextDeliveryTime(
          new Date(
            Math.max(
              now.getTime(),
              reminder.triggerAt.getTime(),
              reminder.task.remindersSnoozedUntil?.getTime() ?? 0,
              adaptiveNotBefore,
            ),
          ),
          reminder.task.user,
          reminder.task.priority,
          reminder.task.deadline,
        );
        const existingJob = await this.queue.getJob(reminder.id);
        if (reminder.adminRetryRequestedAt) {
          const state = existingJob ? await existingJob.getState() : null;
          if (state === 'active') continue;
          if (state === 'failed') {
            await existingJob.retry('failed');
            await this.reminders.update(reminder.id, {
              adminRetryRequestedAt: null,
            });
            continue;
          }
          if (state === 'completed') await existingJob.remove();
          if (state === 'waiting' || state === 'delayed') {
            await this.reminders.update(reminder.id, {
              adminRetryRequestedAt: null,
            });
          }
        }
        if (
          existingJob &&
          (await existingJob.getState()) === 'delayed' &&
          (Math.abs(
            existingJob.timestamp +
              (existingJob.opts.delay ?? 0) -
              deliveryAt.getTime(),
          ) > 1000 ||
            existingJob.data.channel !== reminder.channel)
        )
          await existingJob.remove();
        await this.queue.add(
          'send',
          { reminderId: reminder.id, channel: reminder.channel },
          {
            jobId: reminder.id,
            delay: Math.max(0, deliveryAt.getTime() - Date.now()),
            attempts: 3,
            backoff: { type: 'exponential', delay: 30000 },
            removeOnComplete: { age: 604800 },
            removeOnFail: { age: 2592000 },
          },
        );
        if (reminder.adminRetryRequestedAt)
          await this.reminders.update(reminder.id, {
            adminRetryRequestedAt: null,
          });
      }
      // Remove delayed/waiting jobs whose task/reminder was deleted.
      const jobs = await this.queue.getJobs(['delayed', 'waiting'], 0, 999);
      for (const job of jobs) {
        if (
          job.data.reminderId &&
          !(await this.reminders.existsBy({ id: job.data.reminderId }))
        )
          await job.remove();
      }
    } finally {
      this.running = false;
    }
  }
}
