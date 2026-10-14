import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue, DelayedError } from 'bullmq';
import { DataSource } from 'typeorm';
import { NotifChannel } from '@entities/enums';
import { User } from '@entities/user.entity';
import { EmailProvider } from '../notifications/providers/email.provider';
import { nextDeliveryTime, localDay } from '../notifications/daily-timing';
import {
  lockDeliveryAccount,
  unlockDeliveryAccount,
} from '../notifications/account-delivery-lock';
import { escapeHtml } from '../notifications/reminder-email';
import { Pair } from './personalization.service';
export const COMPANION_QUEUE = 'accountability';
type Delivery = {
  id: string;
  pair_id: string;
  local_day: string;
  status: string;
  created_at: Date;
};
export function companionAllowed(user: User) {
  return (
    !user.suspendedAt &&
    user.notificationsEnabled &&
    user.notifChannels?.some(
      (p) => p.channel === NotifChannel.EMAIL && p.enabled,
    )
  );
}
@Injectable()
export class CompanionScheduler implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  private readonly logger = new Logger(CompanionScheduler.name);
  constructor(
    private readonly db: DataSource,
    @InjectQueue(COMPANION_QUEUE) private readonly queue: Queue,
    private readonly config: ConfigService,
  ) {}
  onModuleInit() {
    this.timer = setInterval(() => {
      void this.reconcile().catch(() =>
        this.logger.error('Companion reconciliation failed'),
      );
    }, 60000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  async reconcile() {
    if (this.running) return;
    this.running = true;
    try {
      await this.db.query(
        "DELETE FROM task_completion_events WHERE completed_at<now()-interval '90 days'",
      );
      await this.db.query(
        "DELETE FROM accountability_deliveries WHERE created_at<now()-interval '90 days'",
      );
      await this.db.query(
        "DELETE FROM accountability_pairs WHERE (status IN ('revoked','declined') AND COALESCE(revoked_at,created_at)<now()-interval '90 days') OR (status='pending' AND expires_at<now()-interval '90 days')",
      );
      if (!this.config.get<boolean>('notifications.enabled')) return;
      // Re-enqueue durable pending deliveries left by a process interruption.
      const pending = await this.db.query<{ id: string }[]>(
        "SELECT id FROM accountability_deliveries WHERE status='pending' ORDER BY created_at LIMIT 500",
      );
      for (const d of pending) await this.enqueue(d.id);
      const rows = await this.db.query<{ id: string; timezone: string }[]>(
        `SELECT p.id,u.timezone FROM accountability_pairs p JOIN users u ON u.id=p.owner_id JOIN users r ON r.id=p.recipient_id WHERE p.status='accepted' AND p.owner_enabled AND p.recipient_enabled AND u.suspended_at IS NULL AND r.suspended_at IS NULL AND u.notifications_enabled AND r.notifications_enabled AND EXISTS(SELECT 1 FROM notification_preferences WHERE user_id=u.id AND channel='EMAIL' AND enabled) AND EXISTS(SELECT 1 FROM notification_preferences WHERE user_id=r.id AND channel='EMAIL' AND enabled) AND (SELECT count(*) FROM tasks WHERE user_id=u.id AND status IN ('TODO','IN_PROGRESS','BLOCKED') AND deadline<now()-interval '24 hours')>=2 AND NOT EXISTS(SELECT 1 FROM accountability_deliveries d WHERE d.pair_id=p.id AND d.local_day=(now() AT TIME ZONE u.timezone)::date) ORDER BY p.created_at LIMIT 200`,
      );
      for (const row of rows) {
        const deliveries = await this.db.query<{ id: string }[]>(
          `WITH inserted AS(INSERT INTO accountability_deliveries(pair_id,local_day) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING id) SELECT id FROM inserted`,
          [row.id, localDay(new Date(), row.timezone)],
        );
        for (const d of deliveries) await this.enqueue(d.id);
      }
    } finally {
      this.running = false;
    }
  }
  private async enqueue(id: string) {
    await this.queue.add(
      'alert',
      { id },
      {
        jobId: id,
        attempts: 1,
        removeOnComplete: { age: 86400 },
        removeOnFail: { age: 86400 },
      },
    );
  }
}
@Processor(COMPANION_QUEUE)
export class CompanionProcessor extends WorkerHost {
  constructor(
    private readonly db: DataSource,
    private readonly email: EmailProvider,
    private readonly config: ConfigService,
  ) {
    super();
  }
  async process(job: Job<{ id: string }>) {
    const runner = this.db.createQueryRunner();
    await runner.connect();
    let pairId: string | undefined;
    const locked: string[] = [];
    try {
      const [delivery] = await runner.manager.query<Delivery[]>(
        'SELECT *,local_day::text AS local_day FROM accountability_deliveries WHERE id=$1',
        [job.data.id],
      );
      if (!delivery) return;
      pairId = delivery.pair_id;
      await runner.query('SELECT pg_advisory_lock(82613,hashtext($1))', [
        pairId,
      ]);
      const [current] = await runner.manager.query<Delivery[]>(
        'SELECT *,local_day::text AS local_day FROM accountability_deliveries WHERE id=$1',
        [delivery.id],
      );
      if (current.status === 'sending') {
        await runner.query(
          "UPDATE accountability_deliveries SET status='uncertain' WHERE id=$1",
          [delivery.id],
        );
        return;
      }
      if (current.status !== 'pending') return;
      const [pair] = await runner.manager.query<Pair[]>(
        'SELECT * FROM accountability_pairs WHERE id=$1',
        [pairId],
      );
      const cancel = () =>
        runner.query(
          "UPDATE accountability_deliveries SET status='cancelled' WHERE id=$1",
          [delivery.id],
        );
      if (
        !pair ||
        pair.status !== 'accepted' ||
        !pair.owner_enabled ||
        !pair.recipient_enabled ||
        !pair.recipient_id ||
        !this.config.get<boolean>('notifications.enabled')
      ) {
        await cancel();
        return;
      }
      for (const userId of [pair.owner_id, pair.recipient_id].sort()) {
        locked.push(userId);
        if (await lockDeliveryAccount(runner, userId, delivery.created_at)) {
          await cancel();
          return;
        }
      }
      const users = await runner.manager.getRepository(User).find({
          where: [{ id: pair.owner_id }, { id: pair.recipient_id }],
          relations: { notifChannels: true },
        }),
        owner = users.find((u) => u.id === pair.owner_id),
        recipient = users.find((u) => u.id === pair.recipient_id);
      if (
        !owner ||
        !recipient ||
        !companionAllowed(owner) ||
        !companionAllowed(recipient) ||
        recipient.email.toLowerCase() !== pair.target_email.toLowerCase()
      ) {
        await cancel();
        return;
      }
      const now = new Date();
      if (localDay(now, owner.timezone) !== delivery.local_day) {
        await cancel();
        return;
      }
      const [count] = await runner.manager.query<{ total: number }[]>(
        "SELECT count(*)::int AS total FROM tasks WHERE user_id=$1 AND status IN ('TODO','IN_PROGRESS','BLOCKED') AND deadline<$2::timestamptz-interval '24 hours'",
        [owner.id, now],
      );
      if (count.total < 2) {
        await cancel();
        return;
      }
      const target = new Date(
        Math.max(
          nextDeliveryTime(now, owner).getTime(),
          nextDeliveryTime(now, recipient).getTime(),
        ),
      );
      if (target.getTime() > now.getTime() + 1000) {
        await job.moveToDelayed(target.getTime(), job.token);
        throw new DelayedError();
      }
      await runner.query(
        "UPDATE accountability_deliveries SET status='sending' WHERE id=$1",
        [delivery.id],
      );
      const url =
        (this.config.get<string>('notifications.appUrl') ?? '').replace(
          /\/$/,
          '',
        ) + '/dashboard/companion';
      const name = escapeHtml(owner.firstName || 'Ton binôme');
      try {
        const receipt = await this.email.send(
          recipient.email,
          'Un petit soutien pour ton binôme — My Daily Page',
          `<html lang="fr"><body style="font-family:Arial,sans-serif;line-height:1.6"><h1>Un petit coup de pouce ?</h1><p>${name} a ${count.total} tâches ouvertes dont l’échéance est dépassée depuis plus de 24 heures.</p><p>Vous avez tous les deux accepté ce partage limité. Aucun titre, description ou document n’est partagé. Tu peux prendre des nouvelles à ta convenance.</p><a href="${escapeHtml(url)}">Gérer mes binômes et mes alertes</a><p>Tu peux suspendre ou révoquer ce lien à tout moment.</p></body></html>`,
          `accountability-${delivery.id}`,
        );
        await runner.query(
          "UPDATE accountability_deliveries SET status='accepted',sent_at=now(),provider_message_id=$2 WHERE id=$1",
          [delivery.id, receipt.messageId],
        );
      } catch (error) {
        await runner.query(
          'UPDATE accountability_deliveries SET status=$2 WHERE id=$1',
          [
            delivery.id,
            error instanceof Error &&
            error.message === 'Resend is not configured'
              ? 'failed'
              : 'uncertain',
          ],
        );
      }
    } finally {
      for (const id of locked.reverse())
        await unlockDeliveryAccount(runner, id);
      if (pairId)
        await runner.query('SELECT pg_advisory_unlock(82613,hashtext($1))', [
          pairId,
        ]);
      await runner.release();
    }
  }
}
