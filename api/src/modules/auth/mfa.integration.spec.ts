import { randomBytes, randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import dataSource from '../../database/data-source';
import { MfaService } from './mfa.service';
import { User } from '@entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { totp } from './mfa-crypto';
const integration =
  process.env.MFA_DATABASE_TESTS === '1' ? describe : describe.skip;
integration('MFA PostgreSQL lifecycle', () => {
  let runner: QueryRunner, service: MfaService, id: string;
  const password = 'Test-password-42!';
  beforeAll(async () => {
    await dataSource.initialize();
  });
  beforeEach(async () => {
    runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    id = randomUUID();
    await runner.query(
      'INSERT INTO users(id,email,password,notifications_enabled) VALUES($1,$2,$3,false)',
      [id, `${id}@example.invalid`, await bcrypt.hash(password, 4)],
    );
    const db = {
      query: <T>(sql: string, params?: unknown[]) =>
        runner.manager.query<T>(sql, params),
      transaction: <T>(fn: (manager: EntityManager) => Promise<T>) =>
        runner.manager.transaction(fn),
    } as DataSource;
    service = new MfaService(
      db,
      new ConfigService({
        mfa: { encryptionKey: randomBytes(32).toString('base64') },
      }),
    );
  });
  afterEach(async () => {
    await runner.rollbackTransaction();
    await runner.release();
  });
  afterAll(async () => {
    await dataSource.destroy();
  });
  it('confirms enrollment, prevents replay, consumes backups once, audits and revokes sessions', async () => {
    const draft = await service.setup(id, password);
    expect((await service.status(id)).enabled).toBe(false);
    const state = await runner.manager.query<{ pending_secret: string }[]>(
      'SELECT pending_secret FROM user_mfa WHERE user_id=$1',
      [id],
    );
    expect(state[0].pending_secret).not.toContain(draft.secret);
    await runner.query(
      "INSERT INTO refresh_tokens(user_id,token_hash,expires_at,session_version) VALUES($1,$2,now()+interval '1 day',0)",
      [id, randomUUID()],
    );
    const code = totp(draft.secret).generate();
    await service.confirm(id, code);
    const strategy = new JwtStrategy(
      new ConfigService({ jwt: { secret: 'test-secret' } }),
      runner.manager.getRepository(User),
    );
    await expect(
      strategy.validate({ sub: id, email: 'unused', ver: 0 }),
    ).rejects.toThrow();
    await expect(
      strategy.validate({ sub: id, email: 'unused', ver: 1 }),
    ).resolves.toMatchObject({ id });
    const revoked = await runner.manager.query<{ revoked_at: Date | null }[]>(
      'SELECT revoked_at FROM refresh_tokens WHERE user_id=$1',
      [id],
    );
    expect(revoked[0].revoked_at).not.toBeNull();
    expect(await service.status(id)).toEqual({
      enabled: true,
      recoveryRemaining: 10,
    });
    await expect(service.verify(id, code)).rejects.toMatchObject({
      response: { code: 'MFA_REUSED' },
    });
    expect(
      (await service.verify(id, draft.recoveryCodes[0])).sessionVersion,
    ).toBe(1);
    await expect(service.verify(id, draft.recoveryCodes[0])).rejects.toThrow();
    const nextCode = totp(draft.secret).generate({
      timestamp: Date.now() + 30000,
    });
    await expect(
      service.verify(id, nextCode.slice(0, 3) + ' ' + nextCode.slice(3)),
    ).resolves.toMatchObject({ id });
    await service.disable(id, password, draft.recoveryCodes[1]);
    await expect(
      strategy.validate({ sub: id, email: 'unused', ver: 1 }),
    ).rejects.toThrow();
    expect(await service.status(id)).toEqual({
      enabled: false,
      recoveryRemaining: 0,
    });
    const users = await runner.manager.query<{ session_version: number }[]>(
      'SELECT session_version FROM users WHERE id=$1',
      [id],
    );
    expect(users[0].session_version).toBe(2);
    const events = await runner.manager.query<{ action: string }[]>(
      'SELECT action FROM admin_audit_events WHERE actor_id=$1',
      [id],
    );
    expect(events.map((e: { action: string }) => e.action)).toEqual([
      'mfa.enable',
      'mfa.recovery_used',
      'mfa.recovery_used',
      'mfa.disable',
    ]);
  });
  it('persists failed attempts, locks after five failures and cancels pending secrets', async () => {
    await service.setup(id, password);
    await service.cancel(id);
    await expect(service.confirm(id, '123456')).rejects.toThrow();
    const draft = await service.setup(id, password);
    await service.confirm(id, totp(draft.secret).generate());
    for (let i = 0; i < 5; i++)
      await expect(service.verify(id, 'invalid')).rejects.toThrow();
    await expect(service.verify(id, draft.recoveryCodes[0])).rejects.toThrow();
    expect((await service.status(id)).recoveryRemaining).toBe(10);
    const rows = await runner.manager.query<
      { failed_attempts: number; locked_until: Date }[]
    >('SELECT failed_attempts,locked_until FROM user_mfa WHERE user_id=$1', [
      id,
    ]);
    expect(rows[0].failed_attempts).toBe(5);
    expect(rows[0].locked_until.getTime()).toBeGreaterThan(Date.now());
    await expect(
      service.verify(id, draft.recoveryCodes[0]),
    ).rejects.toMatchObject({
      response: {
        code: 'MFA_LOCKED',
        retryAt: rows[0].locked_until.toISOString(),
      },
    });
    await runner.query(
      "UPDATE user_mfa SET locked_until=now()-interval '1 second' WHERE user_id=$1",
      [id],
    );
    await expect(service.verify(id, 'invalid')).rejects.toMatchObject({
      response: { code: 'MFA_INVALID' },
    });
    const [reset] = await runner.manager.query<
      { failed_attempts: number; locked_until: Date | null }[]
    >('SELECT failed_attempts,locked_until FROM user_mfa WHERE user_id=$1', [
      id,
    ]);
    expect(reset.failed_attempts).toBe(1);
    expect(reset.locked_until).toBeNull();
    await expect(
      service.verify(id, draft.recoveryCodes[0]),
    ).resolves.toMatchObject({ id });
  });
});
