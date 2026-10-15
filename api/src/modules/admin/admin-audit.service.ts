import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AdminAuditDto } from './dto/admin-audit.dto';
import { DataSource, EntityManager } from 'typeorm';
import { AdminAuditEvent } from '@entities/admin-audit-event.entity';
import { User } from '@entities/user.entity';
export type AdminAction =
  | 'account.suspend'
  | 'account.reactivate'
  | 'rights.change'
  | 'export.request'
  | 'export.download'
  | 'retention.policy'
  | 'retention.hold'
  | 'retention.release'
  | 'retention.preview'
  | 'retention.purge'
  | 'notification.retry';
@Injectable()
export class AdminAuditService {
  constructor(private readonly db: DataSource) {}
  /** Every future administrative write must use this transaction boundary.
   * Record first; commit both the event and mutation, or roll back both.
   * No arbitrary metadata: never store passwords, task content or contact details.
   */
  async mutate<T>(
    actorId: string,
    action: AdminAction,
    targetId: string | null,
    mutation: (manager: EntityManager) => Promise<T>,
    resourceId: string | null = null,
    roleChange?: { before: User['role']; after: User['role'] },
  ): Promise<T> {
    return this.db.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(82611,0)');
      const actor = await manager.getRepository(User).findOne({
        where: { id: actorId },
        lock: { mode: 'pessimistic_read' },
      });
      if (actor?.role !== 'admin' || actor.suspendedAt)
        throw new ForbiddenException('Rôle administrateur requis');
      await manager.getRepository(AdminAuditEvent).insert({
        actorId,
        action,
        targetId,
        resourceId,
        roleBefore: roleChange?.before ?? null,
        roleAfter: roleChange?.after ?? null,
      });
      return mutation(manager);
    });
  }
  async list(
    page: number,
    pageSize: number,
    sortBy = 'createdAt',
    direction: 'asc' | 'desc' = 'desc',
    filters: Partial<AdminAuditDto> = {},
  ) {
    if (
      filters.from &&
      filters.to &&
      new Date(filters.from) >= new Date(filters.to)
    )
      throw new BadRequestException('Invalid audit period');
    const args: unknown[] = [];
    const conditions: string[] = [];
    const add = (column: string, value: unknown, operator = '=') => {
      args.push(value);
      conditions.push(`${column} ${operator} $${args.length}`);
    };
    if (filters.action) add('a.action', filters.action);
    if (filters.from) add('a.created_at', filters.from, '>=');
    if (filters.to) add('a.created_at', filters.to, '<');
    for (const [value, alias, id] of [
      [filters.author, 'actor', 'a.actor_id'],
      [filters.account, 'u', 'a.target_id'],
    ]) {
      if (!value?.trim()) continue;
      args.push('%' + value.trim().replace(/[\\%_]/g, '\\$&') + '%');
      conditions.push(
        `(concat_ws(' ',${alias}.first_name,${alias}.last_name,${alias}.email,${id}::text) ILIKE $${args.length})`,
      );
    }
    const joins =
      'FROM admin_audit_events a LEFT JOIN users u ON u.id=a.target_id LEFT JOIN users actor ON actor.id=a.actor_id';
    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
    const columns: Record<string, string> = {
      action:
        "CASE a.action WHEN 'account.suspend' THEN 'Suspension de compte' WHEN 'account.reactivate' THEN 'Réactivation de compte' WHEN 'rights.change' THEN 'Modification des droits' WHEN 'export.request' THEN 'Demande d’export' WHEN 'export.download' THEN 'Téléchargement d’export' WHEN 'retention.policy' THEN 'Modification de la conservation' WHEN 'retention.hold' THEN 'Exception de conservation' WHEN 'retention.release' THEN 'Levée d’exception' WHEN 'retention.preview' THEN 'Aperçu de purge' WHEN 'retention.purge' THEN 'Purge supervisée' WHEN 'notification.retry' THEN 'Réessai de rappel' WHEN 'mfa.enable' THEN 'Activation MFA' WHEN 'mfa.disable' THEN 'Désactivation MFA' WHEN 'mfa.recovery_used' THEN 'Code de récupération utilisé' ELSE a.action END",
      actorId:
        "LOWER(COALESCE(NULLIF(TRIM(COALESCE(actor.first_name,'') || ' ' || COALESCE(actor.last_name,'')),''),actor.email,a.actor_id::text))",
      target:
        "LOWER(COALESCE(NULLIF(TRIM(COALESCE(u.first_name,'') || ' ' || COALESCE(u.last_name,'')),''),u.email,a.target_id::text))",
      createdAt: 'a.created_at',
    };
    const order = columns[sortBy] ?? columns.createdAt;
    type Row = {
      id: string;
      actorId: string;
      targetId: string | null;
      action: string;
      createdAt: Date;
      actor: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
      } | null;
      target: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
      } | null;
    };
    const [items, total] = await Promise.all([
      this.db.query<Row[]>(
        `SELECT a.id,a.actor_id AS "actorId",a.target_id AS "targetId",a.action,a.role_before AS "roleBefore",a.role_after AS "roleAfter",a.resource_id AS "resourceId",a.created_at AS "createdAt", CASE WHEN u.id IS NULL THEN NULL ELSE json_build_object('id',u.id,'firstName',u.first_name,'lastName',u.last_name,'email',u.email) END AS target, CASE WHEN actor.id IS NULL THEN NULL ELSE json_build_object('id',actor.id,'firstName',actor.first_name,'lastName',actor.last_name,'email',actor.email) END AS actor ${joins}${where} ORDER BY ${order} ${direction === 'asc' ? 'ASC' : 'DESC'} NULLS LAST,a.id DESC LIMIT $${args.length + 1} OFFSET $${args.length + 2}`,
        [...args, pageSize, (page - 1) * pageSize],
      ),
      this.db.query<{ total: number }[]>(
        `SELECT count(*)::int AS total ${joins}${where}`,
        args,
      ),
    ]);
    return { items, total: total[0].total, page, pageSize };
  }
}
