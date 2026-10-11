import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import { randomBytes } from 'crypto';
import { DataSource } from 'typeorm';
import { EmailProvider } from '../notifications/providers/email.provider';
import { PASSWORD_RESET_QUEUE, resetHash } from './password-reset.service';
@Processor(PASSWORD_RESET_QUEUE)
export class PasswordResetWorker extends WorkerHost {
  constructor(
    private readonly db: DataSource,
    private readonly config: ConfigService,
    private readonly email: EmailProvider,
  ) {
    super();
  }
  async process(job: Job<{ email: string }>) {
    const raw = randomBytes(32).toString('hex');
    const hash = resetHash(raw);
    const user = await this.db.transaction(async (manager) => {
      const users: { id: string; email: string }[] = await manager.query(
        'SELECT id, email FROM users WHERE lower(email) = $1 FOR UPDATE',
        [job.data.email],
      );
      if (!users.length) return null;
      const recent: { id: string }[] = await manager.query(
        "SELECT id FROM password_resets WHERE user_id = $1 AND created_at > now() - interval '5 minutes' LIMIT 1",
        [users[0].id],
      );
      if (recent.length) return null;
      await manager.query(
        'UPDATE password_resets SET used_at = now() WHERE user_id = $1 AND used_at IS NULL',
        [users[0].id],
      );
      await manager.query(
        "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '30 minutes')",
        [users[0].id, hash],
      );
      return users[0];
    });
    if (!user) return;
    const link = new URL(
      '/auth/reset.password',
      this.config.get<string>('notifications.appUrl') ??
        'http://localhost:3001',
    );
    link.searchParams.set('token', raw);
    const safeLink = link
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
    try {
      await this.email.send(
        user.email,
        'Réinitialise ton mot de passe — My Daily Page',
        `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px"><h1>Un nouveau mot de passe</h1><p>Tu as demandé à réinitialiser ton mot de passe My Daily Page.</p><p>Ce lien est valable pendant <strong>30 minutes</strong> et ne peut être utilisé qu’une seule fois.</p><p style="margin:28px 0"><a href="${safeLink}" style="background:#0f766e;color:#fff;padding:14px 20px;border-radius:8px;text-decoration:none;display:inline-block">Choisir mon nouveau mot de passe</a></p><p>Si tu n’es pas à l’origine de cette demande, ignore cet email. Ton mot de passe reste inchangé.</p></div>`,
        `password-reset-${hash}`,
      );
    } catch {
      await this.db.query(
        'UPDATE password_resets SET used_at = now() WHERE token_hash = $1',
        [hash],
      );
      // Do not include provider errors that may contain recipient data in queue logs.
      throw new Error('Password reset email could not be sent');
    }
  }
}
