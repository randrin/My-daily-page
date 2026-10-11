import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Job, Queue, DelayedError } from 'bullmq';
import { User } from '@entities/user.entity';
import { NotifChannel, ReminderStatus } from '@entities/enums';
import { SMS_OVERFLOW_QUEUE } from '../queue/queue.constants';
import { localDay, nextDeliveryTime } from './daily-timing';
import { EmailProvider } from './providers/email.provider';
import { DeliveryService } from './delivery.service';

export type OverflowRow = {
  id: string;
  user_id: string;
  date: string;
  status: string;
  snapshot:
    | {
        reminder_id: string;
        task_id: string;
        title: string;
        deadline: string | null;
      }[]
    | null;
};
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
export function overflowEmail(
  items: NonNullable<OverflowRow['snapshot']>,
  date: string,
  appUrl: string,
  timezone: string,
) {
  return `<h1>Les rappels regroupés du ${escape(date)}</h1><p>Ton plafond de 3 SMS par jour a été atteint. Voici les rappels supplémentaires regroupés dans un seul email.</p><ul>${items.map((i) => `<li><strong>${escape(i.title)}</strong>${i.deadline ? ` — ${escape(new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }).format(new Date(i.deadline)))}` : ''} — <a href="${escape(`${appUrl.replace(/\/$/, '')}/dashboard/tasks`)}">Voir mes tâches</a></li>`).join('')}</ul>`;
}
@Injectable()
export class SmsOverflowService implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  private readonly logger = new Logger(SmsOverflowService.name);
  constructor(
    private readonly source: DataSource,
    @InjectQueue(SMS_OVERFLOW_QUEUE)
    private readonly queue: Queue<{ id: string }>,
    private readonly config: ConfigService,
  ) {}
  onModuleInit() {
    this.timer = setInterval(() => {
      void this.reconcile().catch(() =>
        this.logger.error('SMS overflow reconciliation failed'),
      );
    }, 30000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  async collect(reminderId: string, userId: string, date: string) {
    await this.source.transaction(async (manager) => {
      await manager.query(
        `INSERT INTO sms_overflow_digests(user_id,date) VALUES($1,$2) ON CONFLICT DO NOTHING`,
        [userId, date],
      );
      const [digest] = await manager.query<OverflowRow[]>(
        `SELECT * FROM sms_overflow_digests WHERE user_id=$1 AND date=$2 FOR UPDATE`,
        [userId, date],
      );
      if (digest.status !== 'pending')
        throw new Error('SMS digest already sealed');
      await manager.query(
        `INSERT INTO sms_overflow_items(reminder_id,digest_id) VALUES($1,$2) ON CONFLICT DO NOTHING`,
        [reminderId, digest.id],
      );
      await manager.query(
        `UPDATE reminders SET status=$2,delivery_status='grouped',sent_at=NULL,last_error=NULL WHERE id=$1`,
        [reminderId, ReminderStatus.SENT],
      );
    });
  }
  async reconcile() {
    if (this.running || !this.config.get<boolean>('notifications.enabled'))
      return;
    this.running = true;
    try {
      const rows = await this.source.query<OverflowRow[]>(
        `SELECT d.* FROM sms_overflow_digests d JOIN users u ON u.id=d.user_id WHERE d.status='pending' AND d.date < (now() AT TIME ZONE u.timezone)::date ORDER BY d.date,d.id LIMIT 500`,
      );
      for (const row of rows)
        await this.queue.add(
          'digest',
          { id: row.id },
          {
            jobId: row.id,
            attempts: 3,
            backoff: { type: 'exponential', delay: 30000 },
            removeOnComplete: { age: 604800 },
            removeOnFail: { age: 2592000 },
          },
        );
    } finally {
      this.running = false;
    }
  }
}
@Processor(SMS_OVERFLOW_QUEUE)
export class SmsOverflowProcessor extends WorkerHost {
  constructor(
    private readonly source: DataSource,
    private readonly config: ConfigService,
    private readonly email: EmailProvider,
    private readonly delivery: DeliveryService,
  ) {
    super();
  }
  async process(job: Job<{ id: string }>) {
    const runner = this.source.createQueryRunner();
    await runner.connect();
    let locked = false;
    try {
      const [lock] = (await runner.query(
        'SELECT pg_try_advisory_lock(hashtext($1)) AS locked',
        [`sms-digest-${job.data.id}`],
      )) as { locked: boolean }[];
      locked = lock.locked;
      if (!locked) throw new Error('Digest already being processed');
      const [row] = (await runner.query(
        'SELECT *,date::text FROM sms_overflow_digests WHERE id=$1',
        [job.data.id],
      )) as OverflowRow[];
      if (!row || ['accepted', 'cancelled', 'uncertain'].includes(row.status))
        return;
      if (row.status === 'sending') {
        await runner.query(
          `UPDATE sms_overflow_digests SET status='uncertain',last_error='Worker interrupted; verify provider before retry' WHERE id=$1`,
          [row.id],
        );
        return;
      }
      const user = await runner.manager.getRepository(User).findOne({
        where: { id: row.user_id },
        relations: { notifChannels: true },
      });
      if (
        !user?.notificationsEnabled ||
        !user.notifChannels.some(
          (p) => p.channel === NotifChannel.EMAIL && p.enabled,
        )
      ) {
        await runner.query(
          `UPDATE sms_overflow_digests SET status='cancelled',last_error='Email or notifications disabled' WHERE id=$1`,
          [row.id],
        );
        await runner.query(
          `UPDATE reminders SET delivery_status='cancelled',delivery_error='Résumé annulé : notifications ou canal Email désactivés' WHERE id IN (SELECT reminder_id FROM sms_overflow_items WHERE digest_id=$1)`,
          [row.id],
        );
        return;
      }
      if (!this.config.get<boolean>('notifications.enabled'))
        throw new Error('Notification delivery disabled');
      if (row.date >= localDay(new Date(), user.timezone))
        throw new Error('Digest day not finished');
      const at = nextDeliveryTime(new Date(), user);
      if (at.getTime() > Date.now() + 1000) {
        await job.moveToDelayed(at.getTime(), job.token);
        throw new DelayedError();
      }
      // Seal an immutable snapshot; replays use the same content and Resend idempotency key.
      const items =
        row.snapshot ??
        ((await runner.query(
          `SELECT i.reminder_id,t.id AS task_id,t.title,t.deadline FROM sms_overflow_items i JOIN reminders r ON r.id=i.reminder_id JOIN tasks t ON t.id=r.task_id WHERE i.digest_id=$1 AND t.status NOT IN ('DONE','ARCHIVED') ORDER BY r.trigger_at,r.id`,
          [row.id],
        )) as NonNullable<OverflowRow['snapshot']>);
      if (!items.length) {
        await runner.query(
          `UPDATE sms_overflow_digests SET status='cancelled',last_error='No active tasks' WHERE id=$1`,
          [row.id],
        );
        await runner.query(
          `UPDATE reminders SET delivery_status='cancelled',delivery_error='Aucune tâche active dans le résumé' WHERE id IN (SELECT reminder_id FROM sms_overflow_items WHERE digest_id=$1)`,
          [row.id],
        );
        return;
      }
      await runner.query(
        `UPDATE sms_overflow_digests SET snapshot=$2::jsonb,status='sending' WHERE id=$1`,
        [row.id, JSON.stringify(items)],
      );
      let accepted = false;
      try {
        const receipt = await this.email.send(
          user.email,
          `Tes rappels supplémentaires du ${row.date}`,
          overflowEmail(
            items,
            row.date,
            this.config.get<string>('notifications.appUrl'),
            user.timezone,
          ),
          `sms-overflow-${row.id}`,
        );
        accepted = true;
        await runner.query(
          `UPDATE sms_overflow_digests SET status='accepted',provider=$2,provider_message_id=$3,delivery_status='accepted' WHERE id=$1`,
          [row.id, receipt.provider, receipt.messageId],
        );
        await runner.query(
          `UPDATE reminders SET provider=$2,provider_message_id=$3,delivery_status='accepted',sent_at=now(),delivery_error=NULL WHERE id=ANY($1::uuid[])`,
          [
            items.map((item) => item.reminder_id),
            receipt.provider,
            receipt.messageId,
          ],
        );
        await runner.query(
          `UPDATE reminders SET delivery_status='cancelled',delivery_error='Tâche clôturée avant le résumé' WHERE id IN (SELECT reminder_id FROM sms_overflow_items WHERE digest_id=$1) AND NOT (id=ANY($2::uuid[]))`,
          [row.id, items.map((item) => item.reminder_id)],
        );
        await this.delivery.refresh(receipt.provider, receipt.messageId);
      } catch (error) {
        const uncertain =
          accepted ||
          ['ETIMEDOUT', 'ECONNRESET', 'ECONNABORTED'].includes(
            (error as { code?: string }).code ?? '',
          );
        await runner.query(
          `UPDATE sms_overflow_digests SET status=$2,last_error=$3 WHERE id=$1`,
          [
            row.id,
            uncertain
              ? 'uncertain'
              : job.attemptsMade + 1 >= (job.opts.attempts ?? 1)
                ? 'failed'
                : 'pending',
            error instanceof Error ? error.message : 'Email failed',
          ],
        );
        await runner.query(
          `UPDATE reminders SET delivery_status=$2,delivery_error=$3 WHERE id IN (SELECT reminder_id FROM sms_overflow_items WHERE digest_id=$1)`,
          [
            row.id,
            uncertain ? 'uncertain' : 'failed',
            uncertain
              ? 'Envoi du résumé incertain ; vérification fournisseur nécessaire'
              : 'Échec de l’envoi du résumé email',
          ],
        );
        throw error;
      }
    } finally {
      if (locked)
        await runner.query('SELECT pg_advisory_unlock(hashtext($1))', [
          `sms-digest-${job.data.id}`,
        ]);
      await runner.release();
    }
  }
}
