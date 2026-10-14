import { createHash, randomUUID } from 'crypto';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import dataSource from '../../database/data-source';
import { User } from '@entities/user.entity';
import { RefreshToken } from '@entities/refresh-token.entity';
import { AdminAuditService } from './admin-audit.service';
import { AdminAccountsService } from './admin-accounts.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import {
  lockDeliveryAccount,
  unlockDeliveryAccount,
} from '../notifications/account-delivery-lock';
const integration =
  process.env.ADMIN_ACCOUNTS_DATABASE_TESTS === '1' ? describe : describe.skip;
integration('Account suspension PostgreSQL', () => {
  let runner: QueryRunner,
    service: AdminAccountsService,
    strategy: JwtStrategy,
    auth: AuthService;
  const actor = randomUUID(),
    target = randomUUID(),
    task = randomUUID(),
    reminder = randomUUID();
  beforeAll(async () => {
    await dataSource.initialize();
  });
  beforeEach(async () => {
    runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    for (const [id, role] of [
      [actor, 'admin'],
      [target, 'user'],
    ])
      await runner.query(
        'INSERT INTO users(id,email,password,role,notifications_enabled) VALUES($1,$2,$3,$4,false)',
        [
          id,
          `${id}@example.invalid`,
          await bcrypt.hash('test-password', 4),
          role,
        ],
      );
    await runner.query(
      "INSERT INTO tasks(id,user_id,title,deadline) VALUES($1,$2,'Test',now()+interval '1 day')",
      [task, target],
    );
    await runner.query(
      "INSERT INTO reminders(id,task_id,channel,trigger_at,status) VALUES($1,$2,'EMAIL',now()+interval '1 day','PENDING')",
      [reminder, task],
    );
    await runner.query(
      "INSERT INTO refresh_tokens(user_id,token_hash,expires_at) VALUES($1,$2,now()+interval '1 day')",
      [target, randomUUID()],
    );
    service = new AdminAccountsService(
      new AdminAuditService({
        transaction: <T>(work: (m: EntityManager) => Promise<T>) =>
          runner.manager.transaction(work),
      } as DataSource),
    );
    strategy = new JwtStrategy(
      new ConfigService({ jwt: { secret: 'test-secret' } }),
      runner.manager.getRepository(User),
    );
    auth = new AuthService(
      runner.manager.getRepository(User),
      runner.manager.getRepository(RefreshToken),
      new JwtService({ secret: 'test-secret' }),
      new ConfigService(),
    );
  });
  afterEach(async () => {
    await runner.rollbackTransaction();
    await runner.release();
  });
  afterAll(async () => {
    await dataSource.destroy();
  });
  it('revokes sessions, blocks old access and login, cancels reminders, audits, and requires a new login after reactivation', async () => {
    await expect(
      strategy.validate({ sub: target, email: 'unused' }),
    ).resolves.toMatchObject({ id: target });
    await service.change(actor, target, {
      suspended: true,
      reason: 'security',
    });
    await expect(
      strategy.validate({ sub: target, email: 'unused' }),
    ).rejects.toThrow();
    await expect(
      auth.login({
        email: `${target}@example.invalid`,
        password: 'test-password',
      }),
    ).rejects.toThrow('suspended');
    const rows = await runner.manager.query<{ revoked_at: Date | null }[]>(
      'SELECT revoked_at FROM refresh_tokens WHERE user_id=$1',
      [target],
    );
    expect(rows.every((row) => row.revoked_at)).toBe(true);
    expect(
      (
        await runner.manager.query<{ status: string }[]>(
          'SELECT status FROM reminders WHERE id=$1',
          [reminder],
        )
      )[0].status,
    ).toBe('CANCELLED');
    expect(await lockDeliveryAccount(runner, target)).toBe(true);
    await unlockDeliveryAccount(runner, target);
    await service.change(actor, target, { suspended: false });
    await expect(
      strategy.validate({ sub: target, email: 'unused' }),
    ).rejects.toThrow();
    await expect(
      strategy.validate({ sub: target, email: 'unused', ver: 2 }),
    ).resolves.toMatchObject({ id: target });
    expect(
      await lockDeliveryAccount(runner, target, new Date('2000-01-01')),
    ).toBe(true);
    await unlockDeliveryAccount(runner, target);
    expect(
      await lockDeliveryAccount(
        runner,
        target,
        new Date(Date.now() + 86400000),
      ),
    ).toBe(false);
    await unlockDeliveryAccount(runner, target);
    const fresh = await auth.login({
      email: `${target}@example.invalid`,
      password: 'test-password',
    });
    expect(
      new JwtService({ secret: 'test-secret' }).verify<{ ver: number }>(
        fresh.access_token,
      ).ver,
    ).toBe(2);
    const staleRaw = 'late-session-' + randomUUID();
    await runner.query(
      "INSERT INTO refresh_tokens(user_id,token_hash,expires_at,session_version) VALUES($1,$2,now()+interval '1 day',0)",
      [target, createHash('sha256').update(staleRaw).digest('hex')],
    );
    await expect(auth.refresh(staleRaw)).rejects.toThrow(
      'Invalid refresh token',
    );
    const events = await runner.manager.query<{ action: string }[]>(
      'SELECT action FROM admin_audit_events WHERE target_id=$1 ORDER BY created_at,id',
      [target],
    );
    expect(events.map((row) => row.action).sort()).toEqual([
      'account.reactivate',
      'account.suspend',
    ]);
  });
  it('rejects self suspension, missing reasons, duplicate changes and revoked administrator rights', async () => {
    await expect(
      service.change(actor, actor, { suspended: true, reason: 'other' }),
    ).rejects.toThrow('propre');
    await expect(
      service.change(actor, target, { suspended: true }),
    ).rejects.toThrow('motif');
    await service.change(actor, target, { suspended: true, reason: 'other' });
    await expect(
      service.change(actor, target, { suspended: true, reason: 'other' }),
    ).rejects.toThrow('déjà');
    await runner.query("UPDATE users SET role='user' WHERE id=$1", [actor]);
    await expect(
      service.change(actor, target, { suspended: false }),
    ).rejects.toThrow('administrateur');
    expect(
      (
        await runner.manager.query<{ count: number }[]>(
          'SELECT count(*)::int count FROM admin_audit_events WHERE target_id=$1',
          [target],
        )
      )[0].count,
    ).toBe(1);
  });
  it('coordinates suspension and delivery locks across database connections', async () => {
    const second = dataSource.createQueryRunner();
    await second.connect();
    try {
      await runner.query('SELECT pg_advisory_xact_lock(82612,hashtext($1))', [
        target,
      ]);
      const blocked = await second.manager.query<{ locked: boolean }[]>(
        'SELECT pg_try_advisory_lock_shared(82612,hashtext($1)) AS locked',
        [target],
      );
      expect(blocked[0].locked).toBe(false);
      await runner.query('SELECT pg_advisory_xact_lock(82611,0)');
      expect(
        (
          await second.manager.query<{ locked: boolean }[]>(
            'SELECT pg_try_advisory_lock(82611,0) AS locked',
          )
        )[0].locked,
      ).toBe(false);
    } finally {
      await second.release();
    }
  });
});
