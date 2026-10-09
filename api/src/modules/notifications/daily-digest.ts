import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { DelayedError, Job, Queue } from 'bullmq';
import { User } from '@entities/user.entity';
import { DailyDigest } from '@entities/daily-digest.entity';
import { NotifChannel, Priority } from '@entities/enums';
import { DAILY_DIGEST_QUEUE } from '../queue/queue.constants';
import { TasksService } from '../tasks/tasks.service';
import { EmailProvider } from './providers/email.provider';
import { localDay, morningTime, nextDeliveryTime } from './daily-timing';

type DigestJob = { digestId: string };

@Injectable()
export class DailyDigestScheduler implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  private readonly logger = new Logger(DailyDigestScheduler.name);
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(DailyDigest)
    private readonly digests: Repository<DailyDigest>,
    @InjectQueue(DAILY_DIGEST_QUEUE) private readonly queue: Queue<DigestJob>,
    private readonly config: ConfigService,
  ) {}
  onModuleInit() {
    this.timer = setInterval(() => {
      void this.reconcile().catch(() =>
        this.logger.error('Daily digest planning failed'),
      );
    }, 30000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  async reconcile(now = new Date()) {
    if (this.running || !this.config.get<boolean>('notifications.enabled'))
      return;
    this.running = true;
    try {
      const users = await this.users.find({
        where: { notificationsEnabled: true, dailyDigestEnabled: true },
        relations: { notifChannels: true },
      });
      for (const user of users) {
        if (
          !user.notifChannels.some(
            (p) => p.channel === NotifChannel.EMAIL && p.enabled,
          )
        )
          continue;
        const date = localDay(now, user.timezone);
        const morning = morningTime(date, user.timezone);
        // Never create a retroactive digest, but keep reconciling an already planned one.
        const planned = await this.digests.findOneBy({ userId: user.id, date });
        if (!planned && now.getTime() > morning.getTime() + 60000) continue;
        await this.digests
          .createQueryBuilder()
          .insert()
          .values({ userId: user.id, date })
          .orIgnore()
          .execute();
        const digest = await this.digests.findOneBy({ userId: user.id, date });
        if (!digest || digest.status !== 'pending') continue;
        const deliveryAt = nextDeliveryTime(
          new Date(Math.max(now.getTime(), morning.getTime())),
          user,
        );
        if (localDay(deliveryAt, user.timezone) !== date) {
          await this.digests.update(digest.id, {
            status: 'cancelled',
            lastError: 'Résumé suspendu pour cette journée',
          });
          continue;
        }
        const existing = await this.queue.getJob(digest.id);
        if (
          existing &&
          (await existing.getState()) === 'delayed' &&
          Math.abs(
            existing.timestamp +
              (existing.opts.delay ?? 0) -
              deliveryAt.getTime(),
          ) > 1000
        )
          await existing.remove();
        await this.queue.add(
          'morning',
          { digestId: digest.id },
          {
            jobId: digest.id,
            delay: Math.max(0, deliveryAt.getTime() - now.getTime()),
            attempts: 1,
            removeOnComplete: { age: 604800 },
            removeOnFail: { age: 2592000 },
          },
        );
      }
    } finally {
      this.running = false;
    }
  }
}

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ],
  );

@Processor(DAILY_DIGEST_QUEUE)
export class DailyDigestProcessor extends WorkerHost {
  constructor(
    private readonly source: DataSource,
    private readonly tasks: TasksService,
    private readonly email: EmailProvider,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async process(job: Job<DigestJob>) {
    const runner = this.source.createQueryRunner();
    await runner.connect();
    let locked = false;
    try {
      const rows = (await runner.query(
        'SELECT pg_try_advisory_lock(hashtext($1)) AS locked',
        [`digest-${job.data.digestId}`],
      )) as { locked: boolean }[];
      locked = rows[0]?.locked === true;
      if (!locked) throw new Error('Digest is already being processed');
      const repo = runner.manager.getRepository(DailyDigest);
      const digest = await repo.findOne({
        where: { id: job.data.digestId },
        relations: { user: { notifChannels: true } },
      });
      if (!digest || digest.status !== 'pending') return;
      const user = digest.user;
      const now = new Date();
      if (
        !this.config.get<boolean>('notifications.enabled') ||
        !user.notificationsEnabled ||
        !user.dailyDigestEnabled ||
        localDay(now, user.timezone) !== digest.date ||
        !user.notifChannels.some(
          (p) => p.channel === NotifChannel.EMAIL && p.enabled,
        )
      ) {
        await repo.update(digest.id, { status: 'cancelled' });
        return;
      }
      const target = nextDeliveryTime(
        new Date(
          Math.max(
            now.getTime(),
            morningTime(digest.date, user.timezone).getTime(),
          ),
        ),
        user,
      );
      if (localDay(target, user.timezone) !== digest.date) {
        await repo.update(digest.id, {
          status: 'cancelled',
          lastError: 'Résumé suspendu pour cette journée',
        });
        return;
      }
      if (target.getTime() > now.getTime() + 1000) {
        await job.moveToDelayed(target.getTime(), job.token);
        throw new DelayedError();
      }
      const today = await this.tasks.findToday(user.id, now);
      if (!today.items.length) {
        await repo.update(digest.id, { status: 'skipped' });
        return;
      }
      const labels = {
        [Priority.URGENT]: 'Urgente',
        [Priority.HIGH]: 'Haute',
        [Priority.MEDIUM]: 'Moyenne',
        [Priority.LOW]: 'Basse',
      };
      const appUrl = this.config.get<string>('notifications.appUrl') ?? '';
      const cards = today.items
        .map(
          (task, index) =>
            `<li style="margin:16px 0;${index === 0 ? 'padding:16px;background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;' : ''}">${index === 0 ? '<p style="color:#92400e;font-weight:bold;margin:0 0 8px">Ta priorité du jour</p>' : '<p style="color:#667085;margin:0 0 8px">Ensuite</p>'}<strong>${escapeHtml(task.title)}</strong><br>Priorité : ${labels[task.priority]} · ${escapeHtml(task.category?.name ?? 'Sans catégorie')}<br>Échéance : ${new Intl.DateTimeFormat('fr-FR', { timeZone: user.timezone, hour: '2-digit', minute: '2-digit' }).format(task.deadline)}</li>`,
        )
        .join('');
      const body = `<html lang="fr"><body style="font-family:Arial,sans-serif;line-height:1.6;color:#182230"><h1>Ta journée en un regard</h1><p>Bonjour${user.firstName ? ` ${escapeHtml(user.firstName)}` : ''}, voici tes priorités du jour.</p><p>${today.total - today.completed} tâche(s) à terminer aujourd’hui. Commence par ta priorité du jour, puis avance sur les autres tâches. Le choix suit la priorité, puis l’échéance la plus proche :</p><ul>${cards}</ul><p>Horaires dans le fuseau ${escapeHtml(user.timezone)}.</p><a href="${escapeHtml(appUrl)}/dashboard/today" style="display:inline-block;padding:12px 20px;background:#2563eb;color:white;text-decoration:none;border-radius:8px">Ouvrir ma page du jour</a></body></html>`;
      await repo.update(digest.id, { status: 'sending', lastError: null });
      try {
        await this.email.send(
          user.email,
          'Tes priorités du jour — My Daily Page',
          body,
          `daily-${digest.id}`,
        );
        await repo.update(digest.id, { status: 'sent' });
      } catch {
        // Keep an explicit uncertain state; never blindly resend after a timeout.
        await repo.update(digest.id, {
          status: 'uncertain',
          lastError:
            'Envoi non confirmé : vérifier auprès du fournisseur avant de renvoyer.',
        });
        throw new Error('Daily digest delivery unconfirmed');
      }
    } finally {
      if (locked)
        await runner.query('SELECT pg_advisory_unlock(hashtext($1))', [
          `digest-${job.data.digestId}`,
        ]);
      await runner.release();
    }
  }
}
