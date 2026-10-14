import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { User } from '@entities/user.entity';
import { TaskDefaults, taskDefaults } from './defaults';
import { InviteCompanionDto, TaskDefaultsDto } from './dto/personalization.dto';
export const companionHash = (token: string) =>
  createHash('sha256').update(token).digest('hex');
export type Pair = {
  id: string;
  owner_id: string;
  target_email: string;
  recipient_id: string | null;
  status: string;
  owner_enabled: boolean;
  recipient_enabled: boolean;
  expires_at: Date;
  created_at: Date;
  accepted_at: Date | null;
};
@Injectable()
export class PersonalizationService {
  constructor(private readonly db: DataSource) {}
  async defaults(userId: string): Promise<TaskDefaults> {
    const user = await this.db
      .getRepository(User)
      .findOneByOrFail({ id: userId });
    const defaults = { ...taskDefaults, ...user.taskDefaults };
    if (defaults.categoryId) {
      const own = await this.db.query<{ id: string }[]>(
        'SELECT id FROM categories WHERE id=$1 AND user_id=$2',
        [defaults.categoryId, userId],
      );
      if (!own.length) defaults.categoryId = null;
    }
    return defaults;
  }
  async updateDefaults(userId: string, input: TaskDefaultsDto) {
    return this.db.transaction(async (m) => {
      await m.query('SELECT id FROM users WHERE id=$1 FOR UPDATE', [userId]);
      if (input.categoryId) {
        const category = await m.query<{ id: string }[]>(
          'SELECT id FROM categories WHERE id=$1 AND user_id=$2 FOR SHARE',
          [input.categoryId, userId],
        );
        if (!category.length)
          throw new BadRequestException(
            'Catégorie indisponible pour ce compte.',
          );
      }
      await m.query('UPDATE users SET task_defaults=$2::jsonb WHERE id=$1', [
        userId,
        JSON.stringify(input),
      ]);
      return input;
    });
  }
  async energy(userId: string) {
    const user = await this.db
      .getRepository(User)
      .findOneByOrFail({ id: userId });
    if (!user.energyEnabled)
      return {
        enabled: false,
        total: 0,
        days: 0,
        suggestions: [] as { hour: number; count: number }[],
      };
    const [stats] = await this.db.query<{ total: number; days: number }[]>(
      `SELECT count(*)::int AS total,count(DISTINCT (completed_at AT TIME ZONE $2)::date)::int AS days FROM task_completion_events WHERE user_id=$1 AND completed_at>=now()-interval '90 days'`,
      [userId, user.timezone],
    );
    const suggestions =
      stats.total >= 5 && stats.days >= 3
        ? await this.db.query<{ hour: number; count: number }[]>(
            `SELECT extract(hour FROM completed_at AT TIME ZONE $2)::int AS hour,count(*)::int AS count FROM task_completion_events WHERE user_id=$1 AND completed_at>=now()-interval '90 days' GROUP BY hour ORDER BY count DESC,hour LIMIT 3`,
            [userId, user.timezone],
          )
        : [];
    return { enabled: true, ...stats, suggestions };
  }
  async setEnergy(userId: string, enabled: boolean) {
    await this.db.transaction(async (m) => {
      await m.query('UPDATE users SET energy_enabled=$2 WHERE id=$1', [
        userId,
        enabled,
      ]);
      if (!enabled)
        await m.query('DELETE FROM task_completion_events WHERE user_id=$1', [
          userId,
        ]);
    });
    return { enabled };
  }
  async pairs(userId: string) {
    return this.db.query<
      {
        id: string;
        direction: string;
        name: string;
        status: string;
        enabled: boolean;
        createdAt: Date;
        acceptedAt: Date | null;
      }[]
    >(
      `SELECT p.id,CASE WHEN p.owner_id=$1 THEN 'outgoing' ELSE 'incoming' END AS direction,CASE WHEN p.owner_id=$1 THEN p.target_email ELSE COALESCE(NULLIF(u.first_name,''),'Ton binôme') END AS name,CASE WHEN p.status='pending' AND p.expires_at<=now() THEN 'expired' ELSE p.status END AS status,CASE WHEN p.owner_id=$1 THEN p.owner_enabled ELSE p.recipient_enabled END AS enabled,p.created_at AS "createdAt",p.accepted_at AS "acceptedAt" FROM accountability_pairs p JOIN users u ON u.id=p.owner_id WHERE p.owner_id=$1 OR (p.recipient_id=$1 AND p.status='accepted') ORDER BY (p.status='accepted') DESC,p.created_at DESC LIMIT 50`,
      [userId],
    );
  }
  async deliveries(userId: string) {
    return this.db.query<
      {
        id: string;
        name: string;
        day: string;
        status: string;
        createdAt: Date;
        sentAt: Date | null;
      }[]
    >(
      `SELECT d.id,COALESCE(NULLIF(u.first_name,''),'Mon binôme') AS name,d.local_day::text AS day,d.status,d.created_at AS "createdAt",d.sent_at AS "sentAt" FROM accountability_deliveries d JOIN accountability_pairs p ON p.id=d.pair_id JOIN users u ON u.id=p.owner_id WHERE p.owner_id=$1 OR p.recipient_id=$1 ORDER BY d.created_at DESC LIMIT 20`,
      [userId],
    );
  }
  async invite(userId: string, input: InviteCompanionDto) {
    if (!input.consent) throw new BadRequestException('Consentement requis.');
    const token = randomBytes(32).toString('hex');
    return this.db.transaction(async (m) => {
      const user = await m.getRepository(User).findOne({
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!user || user.suspendedAt) throw new NotFoundException();
      if (user.email.toLowerCase() === input.email.toLowerCase())
        throw new BadRequestException('Choisis une autre personne.');
      await m.query(
        "UPDATE accountability_pairs SET status='revoked',revoked_at=now(),owner_enabled=false,recipient_enabled=false WHERE owner_id=$1 AND status='pending' AND expires_at<=now()",
        [userId],
      );
      const active = await m.query<{ id: string }[]>(
        "SELECT id FROM accountability_pairs WHERE owner_id=$1 AND status IN ('pending','accepted')",
        [userId],
      );
      if (active.length)
        throw new ConflictException(
          'Révoque d’abord ton invitation ou ton binôme actif.',
        );
      const [quota] = await m.query<{ total: number }[]>(
        "SELECT count(*)::int AS total FROM accountability_pairs WHERE owner_id=$1 AND created_at>now()-interval '1 day'",
        [userId],
      );
      if (quota.total >= 5)
        throw new BadRequestException('Cinq invitations par jour maximum.');
      const [recipient] = await m.query<{ id: string }[]>(
        'SELECT id FROM users WHERE lower(email)=lower($1) AND suspended_at IS NULL',
        [input.email],
      );
      if (!recipient)
        throw new BadRequestException(
          'Choisis l’adresse d’un compte My Daily Page déjà inscrit et actif.',
        );
      const [pair] = await m.query<{ id: string; expiresAt: Date }[]>(
        `WITH p AS(INSERT INTO accountability_pairs(owner_id,target_email,token_hash,recipient_id) VALUES($1,$2,$3,$4) RETURNING *) SELECT id,expires_at AS "expiresAt" FROM p`,
        [userId, input.email, companionHash(token), recipient.id],
      );
      return { ...pair, token };
    });
  }
  async invitation(userId: string, token: string) {
    const user = await this.db
      .getRepository(User)
      .findOneByOrFail({ id: userId });
    const [pair] = await this.db.query<
      { id: string; name: string; expiresAt: Date }[]
    >(
      `SELECT p.id,COALESCE(NULLIF(u.first_name,''),'Ton binôme') AS name,p.expires_at AS "expiresAt" FROM accountability_pairs p JOIN users u ON u.id=p.owner_id WHERE p.token_hash=$1 AND p.status='pending' AND p.expires_at>now() AND lower(p.target_email)=lower($2) AND p.recipient_id=$3 AND u.suspended_at IS NULL`,
      [companionHash(token), user.email, userId],
    );
    if (!pair)
      throw new NotFoundException(
        'Invitation expirée, révoquée ou destinée à un autre compte.',
      );
    return pair;
  }
  async respond(userId: string, token: string, accepted: boolean) {
    return this.db.transaction(async (m) => {
      const user = await m.getRepository(User).findOneOrFail({
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });
      if (user.suspendedAt) throw new NotFoundException('Compte indisponible.');
      const [pair] = await m.query<Pair[]>(
        `SELECT p.* FROM accountability_pairs p JOIN users u ON u.id=p.owner_id WHERE p.token_hash=$1 AND p.status='pending' AND p.expires_at>now() AND lower(p.target_email)=lower($2) AND p.recipient_id=$3 AND u.suspended_at IS NULL FOR UPDATE OF p`,
        [companionHash(token), user.email, userId],
      );
      if (!pair || pair.owner_id === userId)
        throw new NotFoundException('Invitation indisponible.');
      const [count] = await m.query<{ total: number }[]>(
        "SELECT count(*)::int AS total FROM accountability_pairs WHERE recipient_id=$1 AND status='accepted'",
        [userId],
      );
      if (accepted && count.total >= 5)
        throw new BadRequestException('Cinq binômes suivis maximum.');
      await m.query(
        'UPDATE accountability_pairs SET status=$2,recipient_id=$3,recipient_enabled=$4,accepted_at=CASE WHEN $4 THEN now() ELSE NULL END WHERE id=$1',
        [pair.id, accepted ? 'accepted' : 'declined', userId, accepted],
      );
      return { accepted };
    });
  }
  async updatePair(userId: string, id: string, enabled: boolean | null) {
    return this.db.transaction(async (m) => {
      await m.query('SELECT pg_advisory_xact_lock(82613,hashtext($1))', [id]);
      const [pair] = await m.query<Pair[]>(
        'SELECT * FROM accountability_pairs WHERE id=$1 AND (owner_id=$2 OR recipient_id=$2) FOR UPDATE',
        [id, userId],
      );
      if (!pair) throw new NotFoundException('Binôme introuvable.');
      if (enabled !== null && pair.status !== 'accepted')
        throw new BadRequestException('Le binôme doit avoir accepté.');
      if (enabled === null)
        await m.query(
          "UPDATE accountability_pairs SET status='revoked',owner_enabled=false,recipient_enabled=false,revoked_at=now() WHERE id=$1",
          [id],
        );
      else
        await m.query(
          `UPDATE accountability_pairs SET ${pair.owner_id === userId ? 'owner_enabled' : 'recipient_enabled'}=$2 WHERE id=$1`,
          [id, enabled],
        );
      await m.query(
        "UPDATE accountability_deliveries SET status='cancelled' WHERE pair_id=$1 AND status='pending'",
        [id],
      );
      return { updated: true };
    });
  }
}
