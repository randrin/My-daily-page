import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import { User } from '@entities/user.entity';
import { MfaService } from '../auth/mfa.service';
import { AdminAuditService } from './admin-audit.service';
import {
  AdminDataPageDto,
  AdminExportDto,
  RetentionHoldDto,
  RetentionPolicyDto,
  RetentionPurgeDto,
} from './dto/admin-data.dto';
import { userExportCsv } from './admin-csv';
type Policy = {
  auditDays: number;
  reminderDays: number;
  exportDays: number;
  version: number;
};
type Candidates = Record<'audit' | 'reminders' | 'exports', string[]>;
const policySql =
  'SELECT audit_days AS "auditDays",reminder_days AS "reminderDays",export_days AS "exportDays",version FROM admin_retention_policy WHERE id=1';
@Injectable()
export class AdminDataService implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  private readonly logger = new Logger(AdminDataService.name);
  constructor(
    private readonly db: DataSource,
    private readonly mfa: MfaService,
    private readonly audit: AdminAuditService,
  ) {}
  onModuleInit() {
    this.timer = setInterval(() => {
      void this.expire().catch(() =>
        this.logger.error('Temporary export cleanup failed'),
      );
    }, 60000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  async expire() {
    if (this.running) return;
    this.running = true;
    try {
      await this.db.query(
        'UPDATE admin_exports SET content=NULL WHERE expires_at<=now() AND content IS NOT NULL',
      );
      await this.db.query(
        "DELETE FROM admin_purge_plans WHERE expires_at<now()-interval '1 day' AND purged_at IS NULL",
      );
    } finally {
      this.running = false;
    }
  }
  private async proof(
    actorId: string,
    input: { password: string; code: string },
  ) {
    const actor = await this.db.getRepository(User).findOneBy({ id: actorId });
    if (actor?.role !== 'admin' || actor.suspendedAt || !actor.mfaEnabled)
      throw new ForbiddenException(
        'Active ta MFA pour accéder aux opérations de données.',
      );
    return this.mfa.verify(actorId, input.code, input.password);
  }
  private async fresh(
    manager: EntityManager,
    actorId: string,
    version: number,
  ) {
    const actor = await manager.getRepository(User).findOneBy({ id: actorId });
    if (!actor?.mfaEnabled || actor.sessionVersion !== version)
      throw new ForbiddenException('Réauthentification expirée.');
  }
  async exports(actorId: string, input: AdminDataPageDto) {
    const items = await this.db.query<
      {
        id: string;
        createdAt: Date;
        expiresAt: Date;
        rowCount: number;
        available: boolean;
      }[]
    >(
      'SELECT id,created_at AS "createdAt",expires_at AS "expiresAt",row_count AS "rowCount",(expires_at>now() AND content IS NOT NULL AND session_version=(SELECT session_version FROM users WHERE id=$1)) AS available FROM admin_exports WHERE actor_id=$1 ORDER BY created_at DESC,id DESC LIMIT $2 OFFSET $3',
      [actorId, input.pageSize, (input.page - 1) * input.pageSize],
    );
    const total = await this.db.query<{ total: number }[]>(
      'SELECT count(*)::int AS total FROM admin_exports WHERE actor_id=$1',
      [actorId],
    );
    return {
      items,
      total: total[0].total,
      page: input.page,
      pageSize: input.pageSize,
    };
  }
  async createExport(actorId: string, input: AdminExportDto) {
    const from = new Date(input.from),
      to = new Date(input.to);
    if (
      !Number.isFinite(from.getTime()) ||
      !Number.isFinite(to.getTime()) ||
      from >= to ||
      to.getTime() - from.getTime() > 366 * 86400000
    )
      throw new BadRequestException(
        'Choisis une période de 366 jours maximum, avec une fin après le début.',
      );
    const proof = await this.proof(actorId, input),
      id = randomUUID();
    return this.audit.mutate(
      actorId,
      'export.request',
      null,
      async (manager) => {
        await this.fresh(manager, actorId, proof.sessionVersion);
        const active = await manager.query<{ count: number }[]>(
          'SELECT count(*)::int AS count FROM admin_exports WHERE actor_id=$1 AND expires_at>now()',
          [actorId],
        );
        if (active[0].count >= 3)
          throw new BadRequestException(
            'Trois exports sont déjà disponibles. Attends leur expiration.',
          );
        const rows = await manager.query<
          {
            id: string;
            role: string;
            account: string;
            createdAt: Date;
            tasks: number;
          }[]
        >(
          `SELECT u.id,u.role,CASE WHEN u.suspended_at IS NULL THEN 'Actif' ELSE 'Suspendu' END AS account,u.created_at AT TIME ZONE current_setting('TimeZone') AS "createdAt",(SELECT count(*)::int FROM tasks t WHERE t.user_id=u.id) AS tasks FROM users u WHERE u.created_at AT TIME ZONE current_setting('TimeZone') >= $1 AND u.created_at AT TIME ZONE current_setting('TimeZone') < $2 AND ($3::text IS NULL OR u.role=$3) AND ($4::text IS NULL OR (u.suspended_at IS NULL)=($4='active')) ORDER BY u.created_at,u.id LIMIT 10001`,
          [from, to, input.role ?? null, input.account ?? null],
        );
        if (rows.length > 10000)
          throw new BadRequestException(
            'Plus de 10 000 comptes. Réduis les filtres avant d’exporter.',
          );
        const content = Buffer.from(
          userExportCsv(
            rows.map((row) => ({
              ...row,
              createdAt: row.createdAt.toISOString(),
            })),
          ),
          'utf8',
        );
        const result = await manager.query<
          { id: string; expiresAt: Date; rowCount: number }[]
        >(
          `WITH created AS (INSERT INTO admin_exports(id,actor_id,session_version,row_count,filters,content) VALUES($1,$2,$3,$4,$5,$6) RETURNING *) SELECT id,expires_at AS "expiresAt",row_count AS "rowCount" FROM created`,
          [
            id,
            actorId,
            proof.sessionVersion,
            rows.length,
            JSON.stringify({
              from: from.toISOString(),
              to: to.toISOString(),
              role: input.role,
              account: input.account,
            }),
            content,
          ],
        );
        return result[0];
      },
      id,
    );
  }
  async download(actorId: string, id: string) {
    return this.audit.mutate(
      actorId,
      'export.download',
      null,
      async (manager) => {
        const rows = await manager.query<{ content: Buffer }[]>(
          `SELECT e.content FROM admin_exports e JOIN users u ON u.id=e.actor_id WHERE e.id=$1 AND e.actor_id=$2 AND e.expires_at>now() AND e.content IS NOT NULL AND u.mfa_enabled AND u.session_version=e.session_version FOR SHARE OF e`,
          [id, actorId],
        );
        if (!rows.length)
          throw new NotFoundException(
            'Export expiré ou indisponible pour cette session.',
          );
        return rows[0].content;
      },
      id,
    );
  }
  async retention() {
    const [policy, holds, runs] = await Promise.all([
      this.db.query<Policy[]>(policySql),
      this.db.query<
        {
          id: string;
          resourceType: string;
          resourceId: string;
          reason: string;
          createdAt: Date;
        }[]
      >(
        'SELECT id,resource_type AS "resourceType",resource_id AS "resourceId",reason,created_at AS "createdAt" FROM admin_retention_holds WHERE released_at IS NULL ORDER BY created_at DESC LIMIT 100',
      ),
      this.db.query<
        {
          id: string;
          createdAt: Date;
          auditDeleted: number;
          remindersDeleted: number;
          exportsDeleted: number;
        }[]
      >(
        'SELECT id,created_at AS "createdAt",audit_deleted AS "auditDeleted",reminders_deleted AS "remindersDeleted",exports_deleted AS "exportsDeleted" FROM admin_purge_runs ORDER BY created_at DESC LIMIT 20',
      ),
    ]);
    return { policy: policy[0], holds, runs };
  }
  async updatePolicy(actorId: string, input: RetentionPolicyDto) {
    const proof = await this.proof(actorId, input);
    return this.audit.mutate(
      actorId,
      'retention.policy',
      null,
      async (manager) => {
        await this.fresh(manager, actorId, proof.sessionVersion);
        await manager.query(
          'UPDATE admin_retention_policy SET audit_days=$1,reminder_days=$2,export_days=$3,version=version+1 WHERE id=1',
          [input.auditDays, input.reminderDays, input.exportDays],
        );
        return { updated: true };
      },
    );
  }
  async hold(actorId: string, input: RetentionHoldDto) {
    if (input.reason.trim().length < 10)
      throw new BadRequestException('Précise le motif de conservation.');
    const proof = await this.proof(actorId, input),
      id = randomUUID();
    return this.audit.mutate(
      actorId,
      'retention.hold',
      null,
      async (manager) => {
        await this.fresh(manager, actorId, proof.sessionVersion);
        const table = {
          audit: 'admin_audit_events',
          reminders: 'reminders',
          exports: 'admin_exports',
        }[input.resourceType];
        const exists = await manager.query<{ id: string }[]>(
          `SELECT id FROM ${table} WHERE id=$1`,
          [input.resourceId],
        );
        if (!exists.length)
          throw new NotFoundException('Enregistrement introuvable.');
        const duplicates = await manager.query<{ id: string }[]>(
          'SELECT id FROM admin_retention_holds WHERE resource_type=$1 AND resource_id=$2 AND released_at IS NULL',
          [input.resourceType, input.resourceId],
        );
        if (duplicates.length)
          throw new BadRequestException('Une exception active existe déjà.');
        const count = await manager.query<{ total: number }[]>(
          'SELECT count(*)::int AS total FROM admin_retention_holds WHERE released_at IS NULL',
        );
        if (count[0].total >= 100)
          throw new BadRequestException(
            'Cent exceptions actives maximum. Libère les exceptions devenues inutiles.',
          );
        await manager.query(
          'INSERT INTO admin_retention_holds(id,resource_type,resource_id,reason,actor_id) VALUES($1,$2,$3,$4,$5)',
          [
            id,
            input.resourceType,
            input.resourceId,
            input.reason.trim(),
            actorId,
          ],
        );
        return { id };
      },
      id,
    );
  }
  async release(
    actorId: string,
    id: string,
    input: { password: string; code: string },
  ) {
    const proof = await this.proof(actorId, input);
    return this.audit.mutate(
      actorId,
      'retention.release',
      null,
      async (manager) => {
        await this.fresh(manager, actorId, proof.sessionVersion);
        const rows = await manager.query<{ id: string }[]>(
          'WITH released AS (UPDATE admin_retention_holds SET released_at=now() WHERE id=$1 AND released_at IS NULL RETURNING id) SELECT id FROM released',
          [id],
        );
        if (!rows.length)
          throw new NotFoundException('Exception introuvable ou déjà levée.');
        return { released: true };
      },
      id,
    );
  }
  async preview(actorId: string) {
    const id = randomUUID();
    return this.audit.mutate(
      actorId,
      'retention.preview',
      null,
      async (manager) => {
        const actor = await manager
          .getRepository(User)
          .findOneByOrFail({ id: actorId });
        const [policy] = await manager.query<Policy[]>(
          policySql + ' FOR SHARE',
        );
        const definitions = {
          audit: {
            table: 'admin_audit_events x',
            where: 'x.created_at < now()-make_interval(days=>$1)',
            days: policy.auditDays,
          },
          reminders: {
            table: 'reminders x JOIN tasks t ON t.id=x.task_id',
            where:
              "t.status IN ('DONE','ARCHIVED') AND x.status IN ('SENT','FAILED','CANCELLED') AND x.admin_retry_requested_at IS NULL AND GREATEST(x.trigger_at,COALESCE(x.sent_at,x.trigger_at)) < now()-make_interval(days=>$1)",
            days: policy.reminderDays,
          },
          exports: {
            table: 'admin_exports x',
            where: 'x.expires_at < now()-make_interval(days=>$1)',
            days: policy.exportDays,
          },
        };
        const candidates: Candidates = {
          audit: [],
          reminders: [],
          exports: [],
        };
        for (const type of ['audit', 'reminders', 'exports'] as const) {
          const definition = definitions[type];
          const rows = await manager.query<{ id: string }[]>(
            `SELECT x.id FROM ${definition.table} WHERE ${definition.where} AND NOT EXISTS(SELECT 1 FROM admin_retention_holds h WHERE h.resource_type=$2 AND h.resource_id=x.id AND h.released_at IS NULL) ORDER BY x.id LIMIT 1000`,
            [definition.days, type],
          );
          candidates[type] = rows.map((row) => row.id);
        }
        const result = await manager.query<{ expiresAt: Date }[]>(
          'WITH plan AS (INSERT INTO admin_purge_plans(id,actor_id,session_version,policy_version,candidates) VALUES($1,$2,$3,$4,$5) RETURNING expires_at) SELECT expires_at AS "expiresAt" FROM plan',
          [
            id,
            actorId,
            actor.sessionVersion,
            policy.version,
            JSON.stringify(candidates),
          ],
        );
        return {
          id,
          expiresAt: result[0].expiresAt,
          counts: {
            audit: candidates.audit.length,
            reminders: candidates.reminders.length,
            exports: candidates.exports.length,
          },
        };
      },
      id,
    );
  }
  async purge(actorId: string, input: RetentionPurgeDto) {
    if (input.confirmation !== 'PURGER')
      throw new BadRequestException('Confirmation explicite requise.');
    const proof = await this.proof(actorId, input);
    return this.audit.mutate(
      actorId,
      'retention.purge',
      null,
      async (manager) => {
        await this.fresh(manager, actorId, proof.sessionVersion);
        const plan = await manager.query<{ id: string }[]>(
          'SELECT id FROM admin_purge_plans WHERE id=$1 AND actor_id=$2 AND session_version=$3 AND policy_version=(SELECT version FROM admin_retention_policy WHERE id=1) AND purged_at IS NULL AND expires_at>now() FOR UPDATE',
          [input.planId, actorId, proof.sessionVersion],
        );
        if (!plan.length)
          throw new BadRequestException(
            'Aperçu expiré, déjà utilisé ou issu d’une ancienne session. Recalcule-le.',
          );
        await manager.query(
          'INSERT INTO admin_purge_runs(id,actor_id) VALUES($1,$2)',
          [input.planId, actorId],
        );
        const [run] = await manager.query<
          {
            auditDeleted: number;
            remindersDeleted: number;
            exportsDeleted: number;
          }[]
        >(
          'SELECT audit_deleted AS "auditDeleted",reminders_deleted AS "remindersDeleted",exports_deleted AS "exportsDeleted" FROM admin_purge_runs WHERE id=$1',
          [input.planId],
        );
        return run;
      },
      input.planId,
    );
  }
}
