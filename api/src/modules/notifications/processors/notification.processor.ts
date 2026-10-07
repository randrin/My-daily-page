import { reminderEmail } from '../reminder-email';
import { signReminderAction } from '../reminder-action';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue } from 'bullmq';
import type Redis from 'ioredis';
import { DataSource } from 'typeorm';
import { NotifChannel, ReminderStatus, TaskStatus } from '@entities/enums';
import { Reminder } from '@entities/reminder.entity';
import { NOTIFICATION_QUEUE } from '../../queue/queue.constants';
import { NotificationJobPayload } from '../interfaces/notification-job.interface';
import { EmailProvider } from '../providers/email.provider';
import { SmsProvider } from '../providers/sms.provider';
import { WhatsappProvider } from '../providers/whatsapp.provider';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);
  constructor(
    private readonly source: DataSource,
    private readonly config: ConfigService,
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly queue: Queue<NotificationJobPayload>,
    private readonly emailProvider: EmailProvider,
    private readonly smsProvider: SmsProvider,
    private readonly whatsappProvider: WhatsappProvider,
  ) {
    super();
  }

  async process(job: Job<NotificationJobPayload>): Promise<void> {
    const runner = this.source.createQueryRunner();
    await runner.connect();
    let locked = false;
    try {
      const rows = (await runner.query(
        'SELECT pg_try_advisory_lock(hashtext($1)) AS locked',
        [job.data.reminderId],
      )) as { locked: boolean }[];
      locked = rows[0]?.locked === true;
      if (!locked) throw new Error('Reminder is already being processed');
      const repo = runner.manager.getRepository(Reminder);
      const reminder = await repo.findOne({
        where: { id: job.data.reminderId },
        relations: { task: { category: true, user: { notifChannels: true } } },
      });
      if (
        !reminder ||
        [ReminderStatus.SENT, ReminderStatus.CANCELLED].includes(
          reminder.status,
        )
      )
        return;
      if (reminder.status === ReminderStatus.SENDING) {
        await repo.update(reminder.id, {
          status: ReminderStatus.FAILED,
          lastError:
            'Delivery uncertain after worker interruption; manual verification required',
        });
        return; // Never resend a possibly delivered Twilio message blindly.
      }
      const task = reminder.task;
      const preference = task.user.notifChannels.find(
        (p) => p.channel === reminder.channel && p.enabled,
      );
      const stale =
        reminder.automaticKey &&
        !reminder.automaticKey.startsWith('fallback-') &&
        (!task.deadline ||
          ![0, 2 * 3600000, 24 * 3600000, 72 * 3600000].some(
            (offset) =>
              task.deadline.getTime() - offset === reminder.triggerAt.getTime(),
          ));
      if (
        [TaskStatus.DONE, TaskStatus.ARCHIVED].includes(task.status) ||
        !task.user.notificationsEnabled ||
        !preference ||
        stale ||
        (reminder.channel === NotifChannel.WHATSAPP &&
          !preference.whatsappOptIn)
      ) {
        await repo.update(reminder.id, {
          status: ReminderStatus.CANCELLED,
          lastError:
            'Task completed, schedule changed or notifications disabled',
        });
        return;
      }
      if (reminder.triggerAt.getTime() > Date.now() + 1000)
        throw new Error('Reminder is not due yet');
      if (!this.config.get<boolean>('notifications.enabled')) {
        await repo.update(reminder.id, {
          status: ReminderStatus.FAILED,
          lastError: 'Notification delivery is disabled',
        });
        throw new Error('Notification delivery is disabled');
      }
      const token = signReminderAction(
        reminder.id,
        reminder.triggerAt.getTime() + 7 * 86400000,
        this.config.get<string>('jwt.secret'),
      );
      const link = `${this.config.get<string>('notifications.appUrl')}/reminders/done?token=${encodeURIComponent(token)}`;
      const emailHtml = reminderEmail({
        title: task.title,
        category: task.category?.name,
        priority: task.priority,
        description: task.description,
        firstName: task.user.firstName,
        deadline: task.deadline,
        timezone: task.user.timezone,
        actionUrl: link,
        appUrl: this.config.get<string>('notifications.appUrl'),
      });
      const subject = `À ne pas oublier : ${task.title}`;
      const deadline = task.deadline
        ? new Intl.DateTimeFormat('fr-FR', {
            timeZone: task.user.timezone,
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(task.deadline)
        : 'non précisée';
      const body = [
        'My Daily Page — Rappel',
        `Ta tâche « ${task.title} » arrive à échéance.`,
        `Échéance : ${deadline}.`,
        '',
        'Déjà fait ? Ouvre ce lien pour confirmer :',
        link,
      ].join('\n');
      await repo.update(reminder.id, {
        status: ReminderStatus.SENDING,
        attempts: reminder.attempts + 1,
        lastError: null,
      });
      let accepted = false;
      try {
        if (reminder.channel === NotifChannel.EMAIL) {
          await this.emailProvider.send(
            task.user.email,
            subject,
            emailHtml,
            reminder.id,
          );
        } else if (reminder.channel === NotifChannel.SMS) {
          if (!task.user.phoneNumber)
            throw new Error('SMS requires a phone number');
          const redis = (await this.queue.client) as unknown as Redis;
          const day = new Intl.DateTimeFormat('en-CA', {
            timeZone: task.user.timezone,
          }).format(new Date());
          const quota = await redis.eval(
            `if redis.call('SISMEMBER', KEYS[1], ARGV[1]) == 1 then return 1 end if redis.call('SCARD', KEYS[1]) >= 3 then return 0 end redis.call('SADD', KEYS[1], ARGV[1]); redis.call('EXPIRE', KEYS[1], 172800); return 1`,
            1,
            `sms-quota-${task.userId}-${day}`,
            reminder.id,
          );
          if (Number(quota) === 0) {
            if (
              !task.user.notifChannels.some(
                (p) => p.channel === NotifChannel.EMAIL && p.enabled,
              )
            )
              throw new Error('Daily SMS limit reached and email is disabled');
            await this.emailProvider.send(
              task.user.email,
              subject,
              emailHtml,
              `${reminder.id}-sms-limit`,
            );
          } else await this.smsProvider.send(task.user.phoneNumber, body);
        } else {
          if (!task.user.whatsappNumber)
            throw new Error('WhatsApp requires a number');
          await this.whatsappProvider.send(task.user.whatsappNumber, body);
        }
        accepted = true;
        await repo.update(reminder.id, {
          status: ReminderStatus.SENT,
          sentAt: new Date(),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown provider error';
        const code = (error as { code?: string }).code;
        const uncertain =
          accepted ||
          ['ETIMEDOUT', 'ECONNRESET', 'ECONNABORTED'].includes(code ?? '');
        await repo.update(reminder.id, {
          status: uncertain ? ReminderStatus.SENDING : ReminderStatus.FAILED,
          lastError: uncertain
            ? `Delivery uncertain; verify provider: ${message}`
            : message,
        });
        const lastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
        if (
          !uncertain &&
          lastAttempt &&
          reminder.channel === NotifChannel.WHATSAPP &&
          task.user.notifChannels.some(
            (p) => p.channel === NotifChannel.EMAIL && p.enabled,
          )
        ) {
          // Separate durable email reminder; the failed WhatsApp remains visible.
          const key = `fallback-${reminder.id}`;
          await repo
            .createQueryBuilder()
            .insert()
            .values({
              taskId: task.id,
              channel: NotifChannel.EMAIL,
              triggerAt: new Date(),
              status: ReminderStatus.PENDING,
              automaticKey: key,
            })
            .orIgnore()
            .execute();
        }
        this.logger.error(`Reminder ${reminder.id}: ${message}`);
        throw error;
      }
    } finally {
      if (locked)
        await runner.query('SELECT pg_advisory_unlock(hashtext($1))', [
          job.data.reminderId,
        ]);
      await runner.release();
    }
  }
}
