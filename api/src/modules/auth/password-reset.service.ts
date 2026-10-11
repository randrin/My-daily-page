import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DataSource } from 'typeorm';
import { createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
export const PASSWORD_RESET_QUEUE = 'password-reset';
export const resetHash = (value: string) =>
  createHash('sha256').update(value).digest('hex');
@Injectable()
export class PasswordResetService {
  constructor(
    private readonly db: DataSource,
    @InjectQueue(PASSWORD_RESET_QUEUE) private readonly queue: Queue,
  ) {}
  async request(email: string) {
    // The same asynchronous path for known/unknown addresses avoids account enumeration.
    const normalized = email.trim().toLowerCase();
    await this.queue.add(
      'send',
      { email: normalized },
      {
        jobId: `${resetHash(normalized)}-${Math.floor(Date.now() / 300000)}`,
        attempts: 1,
        removeOnComplete: { age: 600 },
        removeOnFail: { age: 600 },
      },
    );
    return { accepted: true };
  }
  async reset(token: string, password: string) {
    const hash = resetHash(token);
    const passwordHash = await bcrypt.hash(password, 12);
    await this.db.transaction(async (manager) => {
      const users: { id: string }[] = await manager.query(
        `SELECT id FROM users WHERE id = (SELECT user_id FROM password_resets WHERE token_hash = $1) FOR UPDATE`,
        [hash],
      );
      if (!users.length)
        throw new BadRequestException(
          'Ce lien est invalide ou a expiré. Demande un nouveau lien.',
        );
      const consumed: { id: string }[] = await manager.query(
        `WITH consumed AS (UPDATE password_resets SET used_at = now() WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now() RETURNING id) SELECT id FROM consumed`,
        [hash],
      );
      if (!consumed.length)
        throw new BadRequestException(
          'Ce lien est invalide ou a expiré. Demande un nouveau lien.',
        );
      await manager.query('UPDATE users SET password = $1 WHERE id = $2', [
        passwordHash,
        users[0].id,
      ]);
      await manager.query(
        'UPDATE password_resets SET used_at = now() WHERE user_id = $1 AND used_at IS NULL',
        [users[0].id],
      );
      await manager.query(
        'UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL',
        [users[0].id],
      );
    });
    return { updated: true };
  }
}
