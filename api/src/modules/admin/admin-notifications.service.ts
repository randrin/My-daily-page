import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { DataSource } from 'typeorm';
import {
  NOTIFICATION_QUEUE,
  DAILY_DIGEST_QUEUE,
  SMS_OVERFLOW_QUEUE,
} from '../queue/queue.constants';
import { AdminNotificationsDto } from './dto/admin-notifications.dto';
import {
  retrySafe,
  unitPrice,
  retryableErrors,
} from './admin-notification-rules';
import { AdminAuditService } from './admin-audit.service';
type Group = {
  channel: string;
  provider: string;
  status: string;
  count: number;
  accepted: number;
};
type Failure = {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  id: string;
  channel: string;
  provider: string;
  status: string;
  deliveryStatus: string | null;
  triggerAt: Date;
  attempts: number;
  retryEligible: boolean;
  diagnostic: string;
};
@Injectable()
export class AdminNotificationsService {
  constructor(
    private readonly db: DataSource,
    private readonly config: ConfigService,
    private readonly audit: AdminAuditService,
    @InjectQueue(NOTIFICATION_QUEUE) private readonly notifications: Queue,
    @InjectQueue(DAILY_DIGEST_QUEUE) private readonly digests: Queue,
    @InjectQueue(SMS_OVERFLOW_QUEUE) private readonly overflow: Queue,
  ) {}
  async overview(input: AdminNotificationsDto) {
    const start = new Date(Date.now() - input.days * 86400000),
      end = new Date();
    const args: unknown[] = [start, end];
    let where = 'r.trigger_at >= $1 AND r.trigger_at <= $2';
    if (input.channel) {
      args.push(input.channel);
      where += ` AND r.channel=$${args.length}`;
    }
    if (input.provider) {
      args.push(input.provider);
      where += ` AND COALESCE(r.provider,'unknown')=$${args.length}`;
    }
    const groups = await this.db.query<Group[]>(
      `SELECT r.channel,COALESCE(r.provider,'unknown') AS provider,COALESCE(r.delivery_status,LOWER(r.status::text)) AS status,count(*)::int AS count,count(*) FILTER (WHERE (r.provider_message_id IS NOT NULL OR r.status='SENT') AND NOT EXISTS(SELECT 1 FROM sms_overflow_items i WHERE i.reminder_id=r.id))::int AS accepted FROM reminders r WHERE ${where} GROUP BY r.channel,r.provider,COALESCE(r.delivery_status,LOWER(r.status::text)) ORDER BY r.channel,provider,status`,
      args,
    );
    let failureWhere = `${where} AND (r.status IN ('FAILED','SENDING') OR r.delivery_status IN ('failed','complained'))`;
    for (const [value, column] of [
      [input.failureChannel, 'r.channel'],
      [input.failureProvider, "COALESCE(r.provider,'unknown')"],
      [
        input.failureStatus,
        'COALESCE(r.delivery_status,LOWER(r.status::text))',
      ],
    ]) {
      if (value) {
        args.push(value);
        failureWhere += ` AND ${column}=$${args.length}`;
      }
    }
    const counts = await this.db.query<{ total: number }[]>(
      `SELECT count(*)::int total FROM reminders r WHERE ${failureWhere}`,
      args,
    );
    const sortColumns: Record<string, string> = {
      user: "LOWER(COALESCE(NULLIF(TRIM(COALESCE(u.first_name,'') || ' ' || COALESCE(u.last_name,'')),''),u.email))",
      channel: 'r.channel',
      provider: "COALESCE(r.provider,'unknown')",
      status: 'COALESCE(r.delivery_status,LOWER(r.status::text))',
      attempts: 'r.attempts',
      triggerAt: 'r.trigger_at',
    };
    const order = sortColumns[input.sortBy] ?? sortColumns.triggerAt;
    const failures = await this.db.query<Failure[]>(
      `SELECT r.id,json_build_object('id',u.id,'firstName',u.first_name,'lastName',u.last_name,'email',u.email) AS "user",r.channel,COALESCE(r.provider,'unknown') AS provider,r.status,r.delivery_status AS "deliveryStatus",r.trigger_at AS "triggerAt",r.attempts,CASE WHEN r.status='SENDING' THEN 'Envoi en cours ou incertain : vérifier le fournisseur' WHEN r.last_error=ANY($${args.length + 1}::text[]) THEN 'Vérifier la configuration du fournisseur ou les coordonnées du profil' WHEN r.delivery_status IN ('failed','complained') THEN 'Échec ou signalement confirmé par le fournisseur' ELSE 'Échec technique : consulter les logs sécurisés' END AS diagnostic,COALESCE((r.status='FAILED' AND r.provider_message_id IS NULL AND r.delivery_status IS NULL AND r.last_error=ANY($${args.length + 1}::text[]) AND t.deadline>now() AND u.suspended_at IS NULL AND u.notifications_enabled AND EXISTS(SELECT 1 FROM notification_preferences p WHERE p.user_id=u.id AND p.channel=r.channel AND p.enabled) AND t.status NOT IN ('DONE','ARCHIVED') AND NOT EXISTS(SELECT 1 FROM reminders f WHERE f.automatic_key='fallback-'||r.id::text AND f.status<>'CANCELLED')),false) AS "retryEligible" FROM reminders r JOIN tasks t ON t.id=r.task_id JOIN users u ON u.id=t.user_id WHERE ${failureWhere} ORDER BY ${order} ${input.sortDirection === 'asc' ? 'ASC' : 'DESC'} NULLS LAST,r.id DESC LIMIT $${args.length + 2} OFFSET $${args.length + 3}`,
      [
        ...args,
        retryableErrors,
        input.pageSize,
        (input.page - 1) * input.pageSize,
      ],
    );
    const costs = groups.map((group) => {
      const rate = unitPrice(
        this.config.get(
          `adminCosts.${group.provider}_${group.channel.toLowerCase()}`,
        ) ?? this.config.get(`adminCosts.${group.channel.toLowerCase()}`),
      );
      return {
        ...group,
        unitPrice: rate,
        estimatedCost:
          rate === null ? null : Number((rate * group.accepted).toFixed(6)),
      };
    });
    const currency = this.config.get<string>('adminCosts.currency') ?? 'EUR';
    return {
      start,
      end,
      days: input.days,
      groups: costs,
      currency,
      failures,
      total: counts[0].total,
      page: input.page,
      pageSize: input.pageSize,
    };
  }
  async queues() {
    return Promise.all(
      [this.notifications, this.digests, this.overflow].map(async (queue) => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
          const snapshot = Promise.all([
            queue.getJobCounts(
              'waiting',
              'delayed',
              'active',
              'failed',
              'completed',
            ),
            queue.getWorkersCount(),
            queue.getJobs(['waiting'], 0, 0, true),
          ]);
          const [counts, workers, jobs] = await Promise.race([
            snapshot,
            new Promise<never>((_, reject) => {
              timer = setTimeout(
                () => reject(new Error('Queue unavailable')),
                3000,
              );
            }),
          ]);
          return {
            name: queue.name,
            available: true,
            counts,
            workers,
            oldestEnqueuedAt: jobs[0] ? new Date(jobs[0].timestamp) : null,
          };
        } catch {
          return {
            name: queue.name,
            available: false,
            counts: null,
            workers: null,
            oldestEnqueuedAt: null,
          };
        } finally {
          if (timer) clearTimeout(timer);
        }
      }),
    );
  }
  async retry(actorId: string, id: string) {
    const targets = await this.db.query<{ user_id: string }[]>(
      'SELECT t.user_id FROM reminders r JOIN tasks t ON t.id=r.task_id WHERE r.id=$1',
      [id],
    );
    if (!targets[0]) throw new BadRequestException('Rappel introuvable');
    return this.audit.mutate(
      actorId,
      'notification.retry',
      targets[0].user_id,
      async (manager) => {
        await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [id]);
        const rows = await manager.query<
          {
            status: string;
            provider_message_id: string | null;
            last_error: string | null;
            delivery_status: string | null;
            eligible: boolean;
          }[]
        >(
          `SELECT r.status,r.provider_message_id,r.last_error,r.delivery_status,(t.deadline>now() AND t.status NOT IN ('DONE','ARCHIVED') AND u.suspended_at IS NULL AND u.notifications_enabled AND NOT EXISTS(SELECT 1 FROM reminders f WHERE f.automatic_key='fallback-'||r.id::text AND f.status<>'CANCELLED') AND EXISTS(SELECT 1 FROM notification_preferences p WHERE p.user_id=u.id AND p.channel=r.channel AND p.enabled)) AS eligible FROM reminders r JOIN tasks t ON t.id=r.task_id JOIN users u ON u.id=t.user_id WHERE r.id=$1 FOR UPDATE OF r`,
          [id],
        );
        if (!rows[0] || !rows[0].eligible || !retrySafe(rows[0]))
          throw new BadRequestException(
            'Réessai interdit : envoi incertain, déjà accepté, expiré ou compte/canal inactif.',
          );
        await manager.query(
          "UPDATE reminders SET status='PENDING',last_error=NULL,admin_retry_requested_at=now() WHERE id=$1",
          [id],
        );
        return { requested: true };
      },
      id,
    );
  }
}
