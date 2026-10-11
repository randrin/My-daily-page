import dataSource from '../../database/data-source';
import { randomBytes, randomUUID } from 'crypto';
import { Queue } from 'bullmq';
import * as bcrypt from 'bcrypt';
import { PasswordResetService, resetHash } from './password-reset.service';
const integration =
  process.env.PASSWORD_RESET_DATABASE_TESTS === '1' ? describe : describe.skip;
integration('Password reset PostgreSQL single-use semantics', () => {
  const userId = randomUUID();
  const token = randomBytes(32).toString('hex');
  beforeAll(async () => {
    await dataSource.initialize();
    await dataSource.query(
      'INSERT INTO users (id,email,password) VALUES ($1,$2,$3)',
      [
        userId,
        `recovery-test-${userId}@example.invalid`,
        await bcrypt.hash('old-password', 10),
      ],
    );
    await dataSource.query(
      "INSERT INTO password_resets (user_id,token_hash,expires_at) VALUES ($1,$2,now()+interval '30 minutes')",
      [userId, resetHash(token)],
    );
    await dataSource.query(
      "INSERT INTO refresh_tokens (user_id,token_hash,expires_at) VALUES ($1,$2,now()+interval '1 day')",
      [userId, resetHash(randomBytes(32).toString('hex'))],
    );
  });
  afterAll(async () => {
    if (dataSource.isInitialized) {
      await dataSource.query('DELETE FROM users WHERE id=$1', [userId]);
      await dataSource.destroy();
    }
  });
  it('allows only one concurrent reset and revokes refresh tokens', async () => {
    const service = new PasswordResetService(dataSource, {} as Queue);
    const results = await Promise.allSettled([
      service.reset(token, 'new-password'),
      service.reset(token, 'new-password'),
    ]);
    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    const users: { password: string }[] = await dataSource.query(
      'SELECT password FROM users WHERE id=$1',
      [userId],
    );
    expect(await bcrypt.compare('new-password', users[0].password)).toBe(true);
    const sessions: { active: number }[] = await dataSource.query(
      'SELECT count(*)::int AS active FROM refresh_tokens WHERE user_id=$1 AND revoked_at IS NULL',
      [userId],
    );
    expect(sessions[0].active).toBe(0);
  });
  it('rejects expired tokens without changing the password', async () => {
    const expired = randomBytes(32).toString('hex');
    await dataSource.query(
      "INSERT INTO password_resets (user_id,token_hash,expires_at) VALUES ($1,$2,now()-interval '1 minute')",
      [userId, resetHash(expired)],
    );
    await expect(
      new PasswordResetService(dataSource, {} as Queue).reset(
        expired,
        'another-password',
      ),
    ).rejects.toThrow('invalide');
    const users: { password: string }[] = await dataSource.query(
      'SELECT password FROM users WHERE id=$1',
      [userId],
    );
    expect(await bcrypt.compare('new-password', users[0].password)).toBe(true);
  });
});
