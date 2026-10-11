import { SmsOverflowService } from '../sms-overflow';
import { DeliveryService, DeliveryReceipt } from '../delivery.service';
import { PushService } from '../push.service';
import { nextDeliveryTime } from '../daily-timing';
import { reminderEmail } from '../reminder-email';
import { signReminderAction } from '../reminder-action';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DelayedError, Job, Queue } from 'bullmq';
import type Redis from 'ioredis';
import { DataSource } from 'typeorm';
import {
  NotifChannel,
  Priority,
  ReminderStatus,
  TaskStatus,
} from '@entities/enums';
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
    private readonly pushProvider?: PushService,
    private readonly overflow?: SmsOverflowService,
    private readonly delivery?: DeliveryService,
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
      const adaptive = reminder.automaticKey?.startsWith('adaptive-');
      const stale =
        reminder.automaticKey &&
        !reminder.automaticKey.startsWith('fallback-') &&
        !reminder.automaticKey.startsWith('snooze-') &&
        !(
          adaptive &&
          task.user.adaptiveEscalationEnabled &&
          task.deadline &&
          [0, 3600000, 7200000].some(
            (offset) =>
              task.deadline.getTime() + offset === reminder.triggerAt.getTime(),
          )
        ) &&
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
        (adaptive &&
          (!task.user.adaptiveEscalationEnabled ||
            !task.deadline ||
            task.deadline.getTime() < Date.now() - 7 * 86400000 ||
            task.priority === Priority.URGENT ||
            !task.user.notifChannels.some(
              (p) =>
                p.channel === NotifChannel.WHATSAPP &&
                p.enabled &&
                p.whatsappOptIn,
            ))) ||
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
      if (adaptive && task.deadline) {
        const offset = reminder.triggerAt.getTime() - task.deadline.getTime();
        if (offset > 0) {
          const previousAt = new Date(
            task.deadline.getTime() + offset - 3600000,
          );
          const previous = await repo.findOne({
            where: {
              automaticKey: `${offset > 3600000 ? 'adaptive-' : ''}${task.id}-EMAIL-${previousAt.toISOString()}`,
              status: ReminderStatus.SENT,
            },
          });
          const next = previous?.sentAt
            ? previous.sentAt.getTime() + 3600000
            : Date.now() + 5 * 60000;
          if (next > Date.now() + 1000) {
            await job.moveToDelayed(next, job.token);
            throw new DelayedError();
          }
        }
      }
      const deliveryAt = nextDeliveryTime(
        new Date(
          Math.max(Date.now(), task.remindersSnoozedUntil?.getTime() ?? 0),
        ),
        task.user,
        task.priority,
        task.deadline,
      );
      if (deliveryAt.getTime() > Date.now() + 1000) {
        await job.moveToDelayed(deliveryAt.getTime(), job.token);
        throw new DelayedError();
      }
      const token = signReminderAction(
        reminder.id,
        Math.max(reminder.triggerAt.getTime(), Date.now()) + 7 * 86400000,
        this.config.get<string>('jwt.secret'),
      );
      const link = `${this.config.get<string>('notifications.appUrl')}/reminders/done?token=${encodeURIComponent(token)}`;
      const emailHtml = reminderEmail({
        title: task.title,
        category: task.category?.name,
        priority: task.priority,
        description: task.description,
        amount: task.amount,
        currency: task.currency,
        reference: task.reference,
        imageUrl: task.imageUrl,
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
        ...(task.amount != null
          ? [
              `Montant : ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: task.currency ?? 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(task.amount))}`,
            ]
          : []),
        ...(task.reference ? [`Référence : ${task.reference}`] : []),
        '',
        `Code tâche : ${task.id.replace(/-/g, '').slice(0, 12)}`,
        ...(this.config.get<string>('twilio.inboundUrl') ||
        this.config.get<string>('ultramsg.webhookSecret')
          ? [`Réponds FAIT, 1H ou DEMAIN 9H suivi du code tâche.`]
          : []),
        'Déjà fait ? Ouvre ce lien pour confirmer :',
        link,
      ].join('\n');
      await repo.update(reminder.id, {
        status: ReminderStatus.SENDING,
        attempts: reminder.attempts + 1,
        lastError: null,
      });
      let accepted = false;
      let receipt: DeliveryReceipt | undefined;
      try {
        if (reminder.channel === NotifChannel.EMAIL) {
          receipt = await this.emailProvider.send(
            task.user.email,
            subject,
            emailHtml,
            reminder.id,
          );
        } else if (reminder.channel === NotifChannel.PUSH) {
          if (!this.pushProvider) throw new Error('Push provider unavailable');
          await this.pushProvider.send(task.userId, {
            title: 'My Daily Page — Rappel',
            body: `Ta tâche « ${task.title} » arrive à échéance.`,
            url: '/dashboard/today',
            tag: reminder.id,
          });
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
            if (!this.overflow)
              throw new Error('SMS digest service unavailable');
            await this.overflow.collect(reminder.id, task.userId, day);
            return;
          } else
            receipt = await this.smsProvider.send(task.user.phoneNumber, body);
        } else {
          if (!task.user.whatsappNumber)
            throw new Error('WhatsApp requires a number');
          receipt = await this.whatsappProvider.send(
            task.user.whatsappNumber,
            body,
            `FAIT ${task.id.replace(/-/g, '').slice(0, 12)}`,
          );
        }
        accepted = true;
        if (receipt && this.delivery)
          await this.delivery.bind(reminder.id, receipt);
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
