import { randomUUID } from 'crypto';
import {
  DataSource,
  EntityManager,
  QueryRunner,
  ObjectLiteral,
  EntityTarget,
} from 'typeorm';
import dataSource from '../../database/data-source';
import { AdminAuditService } from './admin-audit.service';
import { AdminAuditEvent } from '@entities/admin-audit-event.entity';
const integration =
  process.env.ADMIN_AUDIT_DATABASE_TESTS === '1' ? describe : describe.skip;
integration('Administrative audit transactions', () => {
  let runner: QueryRunner, service: AdminAuditService;
  const actorId = randomUUID();
  beforeAll(async () => {
    await dataSource.initialize();
  });
  beforeEach(async () => {
    runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    await runner.query(
      "INSERT INTO users(id,email,password,role,notifications_enabled) VALUES($1,$2,'unused','admin',false)",
      [actorId, `${actorId}@example.invalid`],
    );
    service = new AdminAuditService({
      query: <T>(sql: string, params?: unknown[]) =>
        runner.manager.query<T>(sql, params),
      getRepository: <T extends ObjectLiteral>(target: EntityTarget<T>) =>
        runner.manager.getRepository(target),
      transaction: <T>(work: (manager: EntityManager) => Promise<T>) =>
        runner.manager.transaction(work),
    } as DataSource);
  });
  afterEach(async () => {
    await runner.rollbackTransaction();
    await runner.release();
  });
  afterAll(async () => {
    await dataSource.destroy();
  });
  it('sorts every audit column and resolves only the current directory fields with a deleted-account fallback', async () => {
    await runner.query(
      "UPDATE users SET first_name='Marie',last_name='Dupont' WHERE id=$1",
      [actorId],
    );
    await service.mutate(actorId, 'export.request', actorId, () =>
      Promise.resolve(),
    );
    const filtered = await service.list(1, 100, 'createdAt', 'desc', {
      author: actorId,
      account: actorId,
      action: 'export.request',
      from: '2000-01-01T00:00:00Z',
      to: '2100-01-01T00:00:00Z',
    });
    expect(filtered.total).toBe(1);
    expect(filtered.items[0].actorId).toBe(actorId);
    expect(
      (
        await service.list(1, 100, 'createdAt', 'desc', {
          author: actorId,
          action: 'account.suspend',
        })
      ).total,
    ).toBe(0);
    expect(
      (
        await service.list(1, 100, 'createdAt', 'desc', {
          author: actorId + '%',
        })
      ).total,
    ).toBe(0);
    expect(
      (
        await service.list(1, 100, 'createdAt', 'desc', {
          author: actorId,
          from: '2100-01-01T00:00:00Z',
        })
      ).total,
    ).toBe(0);
    for (const key of ['action', 'actorId', 'target', 'createdAt'])
      for (const direction of ['asc', 'desc'] as const) {
        const result = await service.list(1, 100, key, direction);
        const event = result.items.find((item) => item.actorId === actorId);
        expect(event?.actor).toEqual(event?.target);
        expect(event?.target).toEqual({
          id: actorId,
          firstName: 'Marie',
          lastName: 'Dupont',
          email: `${actorId}@example.invalid`,
        });
        expect(JSON.stringify(event)).not.toContain('password');
      }
    await runner.query('DELETE FROM users WHERE id=$1', [actorId]);
    const result = await service.list(1, 100, 'createdAt', 'desc', {
      author: actorId,
      account: actorId,
    });
    expect(result.total).toBe(1);
    expect(result.items.find((item) => item.actorId === actorId)).toMatchObject(
      { actorId, actor: null, targetId: actorId, target: null },
    );
  });
  it('writes the audit before mutation and commits both within the transaction', async () => {
    const result = await service.mutate(
      actorId,
      'account.suspend',
      actorId,
      async (manager) => {
        expect(
          await manager.getRepository(AdminAuditEvent).countBy({ actorId }),
        ).toBe(1);
        await manager.query(
          "UPDATE users SET first_name='audited' WHERE id=$1",
          [actorId],
        );
        return 'ok';
      },
    );
    expect(result).toBe('ok');
    expect(
      await runner.manager.getRepository(AdminAuditEvent).countBy({ actorId }),
    ).toBe(1);
  });
  it('rolls back the audit and mutation when the action fails', async () => {
    await expect(
      service.mutate(actorId, 'rights.change', actorId, async (manager) => {
        await manager.query(
          "UPDATE users SET first_name='rollback' WHERE id=$1",
          [actorId],
        );
        throw new Error('failure');
      }),
    ).rejects.toThrow('failure');
    expect(
      await runner.manager.getRepository(AdminAuditEvent).countBy({ actorId }),
    ).toBe(0);
    const rows = await runner.manager.query<{ first_name: string | null }[]>(
      'SELECT first_name FROM users WHERE id=$1',
      [actorId],
    );
    expect(rows[0].first_name).toBeNull();
  });
  it('denies revoked administrators before invoking the mutation', async () => {
    await runner.query("UPDATE users SET role='user' WHERE id=$1", [actorId]);
    const mutation = jest.fn();
    await expect(
      service.mutate(actorId, 'export.request', null, mutation),
    ).rejects.toThrow('administrateur');
    expect(mutation).not.toHaveBeenCalled();
  });
  it.each([
    "UPDATE admin_audit_events SET action='changed'",
    'DELETE FROM admin_audit_events',
    'TRUNCATE admin_audit_events',
  ])('rejects tampering: %s', async (sql) => {
    await service.mutate(actorId, 'export.request', null, () =>
      Promise.resolve(undefined),
    );
    await expect(
      runner.manager.transaction(async (manager) => {
        await manager.query(sql);
      }),
    ).rejects.toThrow('append-only');
    expect(
      await runner.manager.getRepository(AdminAuditEvent).countBy({ actorId }),
    ).toBe(1);
  });
});
