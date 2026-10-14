import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@entities/user.entity';
import { RefreshToken } from '@entities/refresh-token.entity';
import { AdminAuditEvent } from '@entities/admin-audit-event.entity';
import {
  decryptMfa,
  encryptMfa,
  makeRecoveryCodes,
  newMfaSecret,
  recoveryHash,
  totp,
  totpStep,
} from './mfa-crypto';
type State = {
  secret: string | null;
  pending_secret: string | null;
  pending_expires_at: Date | null;
  last_step: string | null;
  failed_attempts: number;
  locked_until: Date | null;
};
@Injectable()
export class MfaService {
  constructor(
    private readonly db: DataSource,
    private readonly config: ConfigService,
  ) {}
  private key() {
    const raw = this.config.get<string>('mfa.encryptionKey');
    const key = raw ? Buffer.from(raw, 'base64') : Buffer.alloc(0);
    if (key.length !== 32)
      throw new ServiceUnavailableException(
        'Configurer MFA_ENCRYPTION_KEY (32 octets en base64) avant d’activer la MFA.',
      );
    return key;
  }
  private async account(manager: EntityManager, id: string) {
    const user = await manager
      .getRepository(User)
      .findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
    if (!user || user.suspendedAt)
      throw new UnauthorizedException('Account unavailable');
    await manager.query(
      'INSERT INTO user_mfa(user_id) VALUES($1) ON CONFLICT DO NOTHING',
      [id],
    );
    const rows = await manager.query<State[]>(
      'SELECT * FROM user_mfa WHERE user_id=$1 FOR UPDATE',
      [id],
    );
    const state = rows[0];
    if (state.locked_until && state.locked_until.getTime() <= Date.now()) {
      await manager.query(
        'UPDATE user_mfa SET failed_attempts=0,locked_until=NULL WHERE user_id=$1',
        [id],
      );
      state.failed_attempts = 0;
      state.locked_until = null;
    }
    return { user, state };
  }
  private async failed(manager: EntityManager, id: string) {
    await manager.query(
      "UPDATE user_mfa SET failed_attempts=failed_attempts+1,locked_until=CASE WHEN failed_attempts+1>=5 THEN now()+interval '15 minutes' ELSE locked_until END WHERE user_id=$1",
      [id],
    );
  }
  private locked(state: State) {
    return !!state.locked_until && state.locked_until.getTime() > Date.now();
  }
  private async check(
    manager: EntityManager,
    user: User,
    state: State,
    code: string,
  ) {
    if (this.locked(state)) return false;
    code = code.replace(/\s/g, '');
    let ok = false;
    if (/^\d{6}$/.test(code) && state.secret) {
      const step = totpStep(decryptMfa(state.secret, this.key()), code);
      if (
        step !== null &&
        (state.last_step === null || step > Number(state.last_step))
      ) {
        await manager.query(
          'UPDATE user_mfa SET last_step=$2 WHERE user_id=$1',
          [user.id, step],
        );
        ok = true;
      }
    } else if (/^[a-f0-9]{32}$/i.test(code.replace(/[\s-]/g, ''))) {
      const used = await manager.query<{ id: string }[]>(
        'WITH consumed AS (UPDATE mfa_recovery_codes SET used_at=now() WHERE user_id=$1 AND code_hash=$2 AND active AND used_at IS NULL RETURNING id) SELECT id FROM consumed',
        [user.id, recoveryHash(code)],
      );
      ok = used.length === 1;
      if (ok)
        await manager.getRepository(AdminAuditEvent).insert({
          actorId: user.id,
          targetId: user.id,
          action: 'mfa.recovery_used',
        });
    }
    if (ok)
      await manager.query(
        'UPDATE user_mfa SET failed_attempts=0,locked_until=NULL WHERE user_id=$1',
        [user.id],
      );
    else await this.failed(manager, user.id);
    return ok;
  }
  async status(userId: string) {
    const rows = await this.db.query<
      { enabled: boolean; recoveryRemaining: number }[]
    >(
      `SELECT u.mfa_enabled AS enabled,(SELECT count(*)::int FROM mfa_recovery_codes r WHERE r.user_id=u.id AND r.active AND r.used_at IS NULL) AS "recoveryRemaining" FROM users u WHERE u.id=$1`,
      [userId],
    );
    return rows[0];
  }
  async setup(userId: string, password: string) {
    const key = this.key();
    const result = await this.db.transaction(async (manager) => {
      const { user, state } = await this.account(manager, userId);
      if (user.mfaEnabled)
        throw new BadRequestException('La MFA est déjà activée.');
      if (this.locked(state)) return null;
      if (!(await bcrypt.compare(password, user.password))) {
        await this.failed(manager, userId);
        return null;
      }
      const secret = newMfaSecret(),
        codes = makeRecoveryCodes();
      await manager.query(
        "UPDATE user_mfa SET pending_secret=$2,pending_expires_at=now()+interval '10 minutes',failed_attempts=0,locked_until=NULL WHERE user_id=$1",
        [userId, encryptMfa(secret, key)],
      );
      await manager.query(
        'DELETE FROM mfa_recovery_codes WHERE user_id=$1 AND NOT active',
        [userId],
      );
      for (const code of codes)
        await manager.query(
          'INSERT INTO mfa_recovery_codes(user_id,code_hash) VALUES($1,$2)',
          [userId, recoveryHash(code)],
        );
      return {
        secret,
        uri: totp(secret, user.email).toString(),
        recoveryCodes: codes,
      };
    });
    if (!result)
      throw new UnauthorizedException(
        'Mot de passe invalide ou vérification temporairement bloquée.',
      );
    return result;
  }
  async cancel(userId: string) {
    await this.db.transaction(async (manager) => {
      const { user } = await this.account(manager, userId);
      if (user.mfaEnabled)
        throw new BadRequestException('La MFA est déjà activée.');
      await manager.query(
        'UPDATE user_mfa SET pending_secret=NULL,pending_expires_at=NULL WHERE user_id=$1',
        [userId],
      );
      await manager.query(
        'DELETE FROM mfa_recovery_codes WHERE user_id=$1 AND NOT active',
        [userId],
      );
    });
    return { cancelled: true };
  }
  async confirm(userId: string, code: string) {
    const result = await this.db.transaction(async (manager) => {
      const { user, state } = await this.account(manager, userId);
      if (
        user.mfaEnabled ||
        !state.pending_secret ||
        !state.pending_expires_at ||
        state.pending_expires_at.getTime() < Date.now()
      )
        throw new BadRequestException(
          'Configuration expirée ou déjà confirmée. Recommence la configuration.',
        );
      if (this.locked(state)) return false;
      const step = totpStep(decryptMfa(state.pending_secret, this.key()), code);
      if (step === null) {
        await this.failed(manager, userId);
        return false;
      }
      await manager.query(
        'UPDATE user_mfa SET secret=pending_secret,pending_secret=NULL,pending_expires_at=NULL,last_step=$2,failed_attempts=0,locked_until=NULL WHERE user_id=$1',
        [userId, step],
      );
      await manager.query(
        'UPDATE mfa_recovery_codes SET active=true WHERE user_id=$1',
        [userId],
      );
      await manager
        .getRepository(AdminAuditEvent)
        .insert({ actorId: userId, targetId: userId, action: 'mfa.enable' });
      await manager.query(
        'UPDATE users SET mfa_enabled=true,session_version=session_version+1 WHERE id=$1',
        [userId],
      );
      await manager
        .getRepository(RefreshToken)
        .update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() });
      return true;
    });
    if (!result)
      throw new UnauthorizedException(
        'Code invalide ou vérification temporairement bloquée.',
      );
    return { enabled: true, reconnect: true };
  }
  async verify(userId: string, code: string, password?: string) {
    const result = await this.db.transaction(async (manager) => {
      const { user, state } = await this.account(manager, userId);
      if (!user.mfaEnabled) return null;
      if (this.locked(state))
        return {
          failure: 'MFA_LOCKED' as const,
          retryAt: state.locked_until.toISOString(),
        };
      if (
        password !== undefined &&
        !(await bcrypt.compare(password, user.password))
      ) {
        await this.failed(manager, userId);
        return null;
      }
      const normalized = code.replace(/\s/g, '');
      const step =
        /^\d{6}$/.test(normalized) && state.secret
          ? totpStep(decryptMfa(state.secret, this.key()), normalized)
          : null;
      const reused =
        step !== null &&
        state.last_step !== null &&
        step <= Number(state.last_step);
      if (!(await this.check(manager, user, state, normalized))) {
        const [current] = await manager.query<State[]>(
          'SELECT locked_until FROM user_mfa WHERE user_id=$1',
          [userId],
        );
        if (this.locked(current))
          return {
            failure: 'MFA_LOCKED' as const,
            retryAt: current.locked_until.toISOString(),
          };
        if (reused) return { failure: 'MFA_REUSED' as const };
        return null;
      }
      return { id: user.id, sessionVersion: user.sessionVersion };
    });
    if (!result)
      throw new UnauthorizedException({
        code: 'MFA_INVALID',
        message:
          'Code invalide, déjà utilisé, expiré ou vérification temporairement bloquée.',
      });
    if ('failure' in result)
      throw new UnauthorizedException({
        code: result.failure,
        retryAt: result.retryAt,
        message:
          result.failure === 'MFA_LOCKED'
            ? 'Vérification temporairement bloquée après cinq échecs.'
            : 'Ce code a déjà été utilisé. Attends le prochain code de ton application.',
      });
    return result;
  }
  async disable(userId: string, password: string, code: string) {
    const ok = await this.db.transaction(async (manager) => {
      const { user, state } = await this.account(manager, userId);
      if (!user.mfaEnabled)
        throw new BadRequestException('La MFA est déjà désactivée.');
      if (this.locked(state)) return false;
      if (!(await bcrypt.compare(password, user.password))) {
        await this.failed(manager, userId);
        return false;
      }
      if (!(await this.check(manager, user, state, code.trim()))) return false;
      await manager
        .getRepository(AdminAuditEvent)
        .insert({ actorId: userId, targetId: userId, action: 'mfa.disable' });
      await manager.query(
        'UPDATE users SET mfa_enabled=false,session_version=session_version+1 WHERE id=$1',
        [userId],
      );
      await manager.query(
        'UPDATE user_mfa SET secret=NULL,pending_secret=NULL,pending_expires_at=NULL,last_step=NULL WHERE user_id=$1',
        [userId],
      );
      await manager.query('DELETE FROM mfa_recovery_codes WHERE user_id=$1', [
        userId,
      ]);
      await manager
        .getRepository(RefreshToken)
        .update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() });
      return true;
    });
    if (!ok)
      throw new UnauthorizedException(
        'Mot de passe ou code invalide ; vérification éventuellement bloquée.',
      );
    return { enabled: false, reconnect: true };
  }
}
