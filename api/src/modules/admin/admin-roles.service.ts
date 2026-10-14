import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { User } from '@entities/user.entity';
import { RefreshToken } from '@entities/refresh-token.entity';
import { MfaService } from '../auth/mfa.service';
import { AdminAuditService } from './admin-audit.service';
import { AdminRoleDto } from './dto/admin-role.dto';
@Injectable()
export class AdminRolesService {
  constructor(
    private readonly db: DataSource,
    private readonly mfa: MfaService,
    private readonly audit: AdminAuditService,
  ) {}
  async change(actorId: string, targetId: string, input: AdminRoleDto) {
    if (actorId === targetId)
      throw new BadRequestException('Tu ne peux pas modifier ton propre rôle.');
    const actor = await this.db.getRepository(User).findOneBy({ id: actorId });
    if (actor?.role !== 'admin' || actor.suspendedAt || !actor.mfaEnabled)
      throw new ForbiddenException(
        'Un administrateur avec MFA activée est requis.',
      );
    const snapshot = await this.db
      .getRepository(User)
      .findOneBy({ id: targetId });
    if (!snapshot) throw new BadRequestException('Compte introuvable.');
    const proof = await this.mfa.verify(actorId, input.code, input.password);
    return this.audit.mutate(
      actorId,
      'rights.change',
      targetId,
      async (manager) => {
        const currentActor = await manager
          .getRepository(User)
          .findOneBy({ id: actorId });
        if (
          !currentActor?.mfaEnabled ||
          currentActor.sessionVersion !== proof.sessionVersion
        )
          throw new ForbiddenException('Réauthentification expirée.');
        const user = await manager.getRepository(User).findOne({
          where: { id: targetId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!user) throw new BadRequestException('Compte introuvable.');
        if (user.role !== snapshot.role)
          throw new BadRequestException(
            'Le rôle a changé. Recharge la page et confirme de nouveau.',
          );
        if (user.role === input.role)
          throw new BadRequestException('Ce compte possède déjà ce rôle.');
        if (input.role === 'admin' && !user.mfaEnabled)
          throw new BadRequestException(
            'Le compte cible doit activer sa MFA avant de devenir administrateur.',
          );
        if (
          user.role === 'admin' &&
          !user.suspendedAt &&
          input.role !== 'admin' &&
          (await manager
            .getRepository(User)
            .countBy({ role: 'admin', suspendedAt: IsNull() })) <= 1
        )
          throw new BadRequestException(
            'Le dernier administrateur actif doit être conservé.',
          );
        user.role = input.role;
        user.sessionVersion += 1;
        await manager.getRepository(User).save(user);
        await manager
          .getRepository(RefreshToken)
          .update(
            { userId: targetId, revokedAt: IsNull() },
            { revokedAt: new Date() },
          );
        return { id: targetId, role: input.role, reconnect: true };
      },
      null,
      { before: snapshot.role, after: input.role },
    );
  }
}
