import { randomUUID } from 'crypto';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import dataSource from '../../database/data-source';
import { AdminNotificationsService } from './admin-notifications.service';
import { AdminAuditService } from './admin-audit.service';
import { AdminNotificationsDto } from './dto/admin-notifications.dto';
const integration =
  process.env.ADMIN_NOTIFICATIONS_DATABASE_TESTS === '1'
    ? describe
    : describe.skip;
integration('Supervision and durable retry PostgreSQL', () => {
  let runner: QueryRunner, service: AdminNotificationsService;
  const actor = randomUUID(),
    user = randomUUID(),
    task = randomUUID(),
    reminder = randomUUID();
  const queue = { add: jest.fn() };
  beforeAll(async () => {
    await dataSource.initialize();
  });
  beforeEach(async () => {
    runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    for (const [id, role] of [
      [actor, 'admin'],
      [user, 'user'],
    ])
      await runner.query(
        "INSERT INTO users(id,email,password,role,notifications_enabled) VALUES($1,$2,'unused',$3,true)",
        [id, `${id}@example.invalid`, role],
      );
    await runner.query(
      "INSERT INTO tasks(id,user_id,title,deadline) VALUES($1,$2,'Private task',now()+interval '1 day')",
      [task, user],
    );
    await runner.query(
      "INSERT INTO notification_preferences(user_id,channel,enabled) VALUES($1,'EMAIL',true)",
      [user],
    );
    await runner.query(
      "INSERT INTO reminders(id,task_id,channel,trigger_at,status,last_error) VALUES($1,$2,'EMAIL',now()-interval '1 minute','FAILED','Resend is not configured')",
      [reminder, task],
    );
    const db = {
      query: <T>(sql: string, params?: unknown[]) =>
        runner.manager.query<T>(sql, params),
      transaction: <T>(work: (manager: EntityManager) => Promise<T>) =>
        runner.manager.transaction(work),
    } as DataSource;
    service = new AdminNotificationsService(
      db,
      new ConfigService({ adminCosts: { email: '0.01', currency: 'EUR' } }),
      new AdminAuditService(db),
      queue as unknown as Queue,
      queue as unknown as Queue,
      queue as unknown as Queue,
    );
  });
  afterEach(async () => {
    await runner.rollbackTransaction();
    await runner.release();
  });
  afterAll(async () => {
    await dataSource.destroy();
  });
  it('aggregates by period/channel without leaking task contents and records the retry atomically', async () => {
    const input = Object.assign(new AdminNotificationsDto(), {
      channel: 'EMAIL',
      pageSize: 100,
    });
    const result = await service.overview(input);
    expect(
      result.failures.find((row) => row.id === reminder)?.retryEligible,
    ).toBe(true);
    expect(
      result.groups.some(
        (row) => row.channel === 'EMAIL' && row.unitPrice === 0.01,
      ),
    ).toBe(true);
    expect(JSON.stringify(result)).not.toContain('Private task');
    await service.retry(actor, reminder);
    expect(
      (
        await runner.manager.query<
          { status: string; admin_retry_requested_at: Date }[]
        >('SELECT status,admin_retry_requested_at FROM reminders WHERE id=$1', [
          reminder,
        ])
      )[0],
    ).toMatchObject({
      status: 'PENDING',
      admin_retry_requested_at: expect.any(Date) as unknown,
    });
    expect(
      (
        await runner.manager.query<{ action: string; resource_id: string }[]>(
          'SELECT action,resource_id FROM admin_audit_events WHERE actor_id=$1',
          [actor],
        )
      )[0],
    ).toMatchObject({ action: 'notification.retry', resource_id: reminder });
    await expect(service.retry(actor, reminder)).rejects.toThrow(
      'Réessai interdit',
    );
    expect(queue.add).not.toHaveBeenCalled();
  });
  it('excludes SMS overflow emails from per-reminder cost estimates', async () => {
    const filters = Object.assign(new AdminNotificationsDto(), {
      channel: 'EMAIL',
      provider: 'resend',
    });
    const before = await service.overview(filters);
    const prior = before.groups.find((row) => row.status === 'accepted');
    const digest = randomUUID();
    await runner.query(
      'INSERT INTO sms_overflow_digests(id,user_id,date) VALUES($1,$2,CURRENT_DATE)',
      [digest, user],
    );
    await runner.query(
      'INSERT INTO sms_overflow_items(reminder_id,digest_id) VALUES($1,$2)',
      [reminder, digest],
    );
    await runner.query(
      "UPDATE reminders SET status='SENT',provider='resend',provider_message_id='digest-receipt',delivery_status='accepted' WHERE id=$1",
      [reminder],
    );
    const result = await service.overview(
      Object.assign(new AdminNotificationsDto(), {
        channel: 'EMAIL',
        provider: 'resend',
      }),
    );
    const after = result.groups.find((row) => row.status === 'accepted');
    expect(after?.count).toBe((prior?.count ?? 0) + 1);
    expect(after?.accepted).toBe(prior?.accepted ?? 0);
    expect(after?.estimatedCost).toBe(prior?.estimatedCost ?? 0);
  });
  it('refuses accepted, uncertain, expired and suspended-account retries', async () => {
    for (const change of [
      "provider_message_id='receipt'",
      "last_error='Timeout'",
      "status='SENDING'",
    ]) {
      await runner.query(`UPDATE reminders SET ${change} WHERE id=$1`, [
        reminder,
      ]);
      await expect(service.retry(actor, reminder)).rejects.toThrow(
        'Réessai interdit',
      );
      await runner.query(
        "UPDATE reminders SET status='FAILED',provider_message_id=NULL,last_error='Resend is not configured' WHERE id=$1",
        [reminder],
      );
    }
    await runner.query('UPDATE users SET suspended_at=now() WHERE id=$1', [
      user,
    ]);
    await expect(service.retry(actor, reminder)).rejects.toThrow(
      'Réessai interdit',
    );
    await runner.query('UPDATE users SET suspended_at=NULL WHERE id=$1', [
      user,
    ]);
    await runner.query(
      "UPDATE tasks SET deadline=now()-interval '1 day' WHERE id=$1",
      [task],
    );
    await expect(service.retry(actor, reminder)).rejects.toThrow(
      'Réessai interdit',
    );
  });
});
