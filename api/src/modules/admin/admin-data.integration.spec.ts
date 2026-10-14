import { randomUUID } from 'crypto';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import dataSource from '../../database/data-source';
import { AdminDataService } from './admin-data.service';
import { AdminAuditService } from './admin-audit.service';
import { MfaService } from '../auth/mfa.service';
const integration =
  process.env.ADMIN_DATA_DATABASE_TESTS === '1' ? describe : describe.skip;
integration('Private exports and supervised retention PostgreSQL', () => {
  let runner: QueryRunner,
    service: AdminDataService,
    actor: string,
    other: string,
    support: string;
  const proof = { password: 'test-password', code: '123456' };
  beforeAll(async () => {
    await dataSource.initialize();
  });
  beforeEach(async () => {
    runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    actor = randomUUID();
    other = randomUUID();
    support = randomUUID();
    for (const [id, role] of [
      [actor, 'admin'],
      [other, 'admin'],
      [support, 'support'],
    ])
      await runner.query(
        "INSERT INTO users(id,email,password,role,mfa_enabled,notifications_enabled) VALUES($1,$2,'unused',$3,true,false)",
        [id, `${id}@example.invalid`, role],
      );
    const db = {
      getRepository: <T extends import('typeorm').ObjectLiteral>(
        entity: import('typeorm').EntityTarget<T>,
      ) => runner.manager.getRepository(entity),
      query: <T>(sql: string, params?: unknown[]) =>
        runner.manager.query<T>(sql, params),
      transaction: <T>(fn: (m: EntityManager) => Promise<T>) =>
        runner.manager.transaction(fn),
    } as DataSource;
    service = new AdminDataService(
      db,
      {
        verify: jest.fn().mockResolvedValue({ sessionVersion: 0 }),
      } as unknown as MfaService,
      new AdminAuditService(db),
    );
  });
  afterEach(async () => {
    await runner.rollbackTransaction();
    await runner.release();
  });
  afterAll(async () => {
    await dataSource.destroy();
  });
  it('filters/minimizes CSV, isolates downloads, expires content and rejects old sessions and support', async () => {
    await runner.query(
      "UPDATE users SET created_at='2099-01-10 12:00:00' WHERE id=$1",
      [support],
    );
    const item = await service.createExport(actor, {
      ...proof,
      from: '2099-01-10T00:00:00Z',
      to: '2099-01-11T00:00:00Z',
      role: 'support',
    });
    expect(item.rowCount).toBe(1);
    const csv = (await service.download(actor, item.id)).toString('utf8');
    expect(csv).toContain(support);
    expect(csv).not.toContain('@example');
    expect(csv).not.toContain('unused');
    await expect(service.download(other, item.id)).rejects.toThrow();
    await expect(
      service.createExport(support, {
        ...proof,
        from: '2099-01-10T00:00:00Z',
        to: '2099-01-11T00:00:00Z',
      }),
    ).rejects.toThrow();
    await runner.query('UPDATE users SET session_version=1 WHERE id=$1', [
      actor,
    ]);
    await expect(service.download(actor, item.id)).rejects.toThrow();
    await runner.query(
      "UPDATE admin_exports SET expires_at=now()-interval '1 minute' WHERE id=$1",
      [item.id],
    );
    await expect(service.download(actor, item.id)).rejects.toThrow();
    await service.expire();
    const rows = await runner.manager.query<{ content: Buffer | null }[]>(
      'SELECT content FROM admin_exports WHERE id=$1',
      [item.id],
    );
    expect(rows[0].content).toBeNull();
    await expect(service.download(actor, item.id)).rejects.toThrow();
  });
  it('keeps direct audit mutations forbidden and purges only the approved old records, respecting late holds', async () => {
    const deletable = randomUUID(),
      held = randomUUID(),
      late = randomUUID(),
      newAfter = randomUUID();
    for (const id of [deletable, held, late])
      await runner.query(
        "INSERT INTO admin_audit_events(id,actor_id,action,created_at) VALUES($1,$2,'test.synthetic',now()-interval '400 days')",
        [id, actor],
      );
    await service.hold(actor, {
      ...proof,
      resourceType: 'audit',
      resourceId: held,
      reason: 'Investigation synthétique',
    });
    await expect(
      runner.manager.transaction((m) =>
        m.query('DELETE FROM admin_audit_events WHERE id=$1', [deletable]),
      ),
    ).rejects.toThrow('supervised');
    await expect(
      runner.manager.transaction((m) =>
        m.query("UPDATE admin_audit_events SET action='changed' WHERE id=$1", [
          deletable,
        ]),
      ),
    ).rejects.toThrow('append-only');
    await expect(
      runner.manager.transaction((m) => m.query('TRUNCATE admin_audit_events')),
    ).rejects.toThrow('append-only');
    const closedTask = randomUUID(),
      openTask = randomUUID(),
      closedReminder = randomUUID(),
      pending = randomUUID(),
      openReminder = randomUUID();
    for (const [id, status] of [
      [closedTask, 'DONE'],
      [openTask, 'TODO'],
    ])
      await runner.query(
        "INSERT INTO tasks(id,user_id,title,status) VALUES($1,$2,'synthetic',$3)",
        [id, actor, status],
      );
    for (const [id, task, status] of [
      [closedReminder, closedTask, 'SENT'],
      [pending, closedTask, 'PENDING'],
      [openReminder, openTask, 'FAILED'],
    ])
      await runner.query(
        "INSERT INTO reminders(id,task_id,channel,status,trigger_at) VALUES($1,$2,'EMAIL',$3,now()-interval '100 days')",
        [id, task, status],
      );
    const oldExport = randomUUID();
    await runner.query(
      "INSERT INTO admin_exports(id,actor_id,session_version,row_count,filters,expires_at) VALUES($1,$2,0,0,'{}',now()-interval '8 days')",
      [oldExport, actor],
    );
    const plan = await service.preview(actor);
    await service.hold(actor, {
      ...proof,
      resourceType: 'audit',
      resourceId: late,
      reason: 'Exception ajoutée après aperçu',
    });
    await runner.query(
      "INSERT INTO admin_audit_events(id,actor_id,action,created_at) VALUES($1,$2,'test.synthetic',now()-interval '400 days')",
      [newAfter, actor],
    );
    const result = await service.purge(actor, {
      ...proof,
      planId: plan.id,
      confirmation: 'PURGER',
    });
    expect(result.auditDeleted).toBe(1);
    expect(result.remindersDeleted).toBe(1);
    expect(result.exportsDeleted).toBe(1);
    const remaining = await runner.manager.query<{ id: string }[]>(
      'SELECT id FROM admin_audit_events WHERE id=ANY($1::uuid[])',
      [[deletable, held, late, newAfter]],
    );
    expect(remaining.map((r) => r.id).sort()).toEqual(
      [held, late, newAfter].sort(),
    );
    const reminders = await runner.manager.query<{ id: string }[]>(
      'SELECT id FROM reminders WHERE id=ANY($1::uuid[])',
      [[closedReminder, pending, openReminder]],
    );
    expect(reminders.map((r) => r.id).sort()).toEqual(
      [pending, openReminder].sort(),
    );
    await expect(
      service.purge(actor, {
        ...proof,
        planId: plan.id,
        confirmation: 'PURGER',
      }),
    ).rejects.toThrow();
    const logged = await runner.manager.query<{ total: number }[]>(
      "SELECT count(*)::int AS total FROM admin_audit_events WHERE action='retention.purge' AND resource_id=$1",
      [plan.id],
    );
    expect(logged[0].total).toBe(1);
  });
  it('invalidates previews after policy/session changes and prevents another administrator from using them', async () => {
    const plan = await service.preview(actor);
    await expect(
      service.purge(other, {
        ...proof,
        planId: plan.id,
        confirmation: 'PURGER',
      }),
    ).rejects.toThrow();
    const expired = await service.preview(actor);
    await runner.query(
      "UPDATE admin_purge_plans SET expires_at=now()-interval '1 minute' WHERE id=$1",
      [expired.id],
    );
    await expect(
      service.purge(actor, {
        ...proof,
        planId: expired.id,
        confirmation: 'PURGER',
      }),
    ).rejects.toThrow();
    await service.updatePolicy(actor, {
      ...proof,
      auditDays: 400,
      reminderDays: 120,
      exportDays: 10,
    });
    await expect(
      service.purge(actor, {
        ...proof,
        planId: plan.id,
        confirmation: 'PURGER',
      }),
    ).rejects.toThrow();
    const second = await service.preview(actor);
    await runner.query('UPDATE users SET session_version=1 WHERE id=$1', [
      actor,
    ]);
    await expect(
      service.purge(actor, {
        ...proof,
        planId: second.id,
        confirmation: 'PURGER',
      }),
    ).rejects.toThrow();
  });
});
