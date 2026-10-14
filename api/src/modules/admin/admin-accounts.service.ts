import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IsNull } from 'typeorm';
import { User } from '@entities/user.entity';
import { RefreshToken } from '@entities/refresh-token.entity';
import { AdminAuditService } from './admin-audit.service';
import { AccountStatusDto } from './dto/account-status.dto';
@Injectable()
export class AdminAccountsService {
  constructor(private readonly audit: AdminAuditService) {}
  async change(actorId: string, targetId: string, input: AccountStatusDto) {
    if (actorId === targetId)
      throw new BadRequestException(
        'Tu ne peux pas modifier ton propre état de compte.',
      );
    if (input.suspended && !input.reason)
      throw new BadRequestException('Un motif de suspension est requis.');
    return this.audit.mutate(
      actorId,
      input.suspended ? 'account.suspend' : 'account.reactivate',
      targetId,
      async (manager) => {
        // Wait for any send already in flight; all delivery workers share this account lock.
        await manager.query(
          'SELECT pg_advisory_xact_lock(82612,hashtext($1))',
          [targetId],
        );
        const repo = manager.getRepository(User);
        const user = await repo.findOne({
          where: { id: targetId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!user) throw new NotFoundException('Compte introuvable');
        if (Boolean(user.suspendedAt) === input.suspended)
          throw new BadRequestException('Le compte est déjà dans cet état.');
        if (
          input.suspended &&
          user.role === 'admin' &&
          (await repo.countBy({ role: 'admin', suspendedAt: IsNull() })) <= 1
        )
          throw new BadRequestException(
            'Le dernier administrateur actif ne peut pas être suspendu.',
          );
        const now = new Date();
        user.suspendedAt = input.suspended ? now : null;
        user.suspensionReason = input.suspended ? input.reason : null;
        if (!input.suspended) user.remindersResumedAt = now;
        user.sessionVersion += 1;
        await repo.save(user);
        await manager
          .getRepository(RefreshToken)
          .update(
            { userId: targetId, revokedAt: IsNull() },
            { revokedAt: now },
          );
        if (input.suspended) {
          await manager.query(
            "UPDATE reminders SET delivery_status='cancelled',delivery_error='Compte suspendu' WHERE id IN (SELECT i.reminder_id FROM sms_overflow_items i JOIN sms_overflow_digests d ON d.id=i.digest_id WHERE d.user_id=$1 AND d.status='pending')",
            [targetId],
          );
          await manager.query(
            "UPDATE reminders SET status='CANCELLED',delivery_status='cancelled',delivery_error='Compte suspendu' WHERE task_id IN (SELECT id FROM tasks WHERE user_id=$1) AND status='PENDING'",
            [targetId],
          );
          await manager.query(
            "UPDATE daily_digests SET status='cancelled',last_error='Compte suspendu' WHERE user_id=$1 AND status='pending'",
            [targetId],
          );
          await manager.query(
            "UPDATE sms_overflow_digests SET status='cancelled',last_error='Compte suspendu' WHERE user_id=$1 AND status='pending'",
            [targetId],
          );
        }
        return {
          id: user.id,
          suspendedAt: user.suspendedAt,
        };
      },
    );
  }
}
