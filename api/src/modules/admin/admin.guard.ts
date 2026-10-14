import { Reflector } from '@nestjs/core';
import { ADMIN_ACCESS } from './admin-access.decorator';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly reflector: Reflector = new Reflector(),
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ method?: string; user?: { id: string } }>();
    const user =
      request.user &&
      (await this.users.findOne({
        where: { id: request.user.id },
        select: { id: true, role: true, suspendedAt: true },
      }));
    const access =
      context.getHandler &&
      this.reflector.getAllAndOverride<'read' | 'write' | 'data'>(
        ADMIN_ACCESS,
        [context.getHandler(), context.getClass()],
      );
    if (
      !user ||
      user.suspendedAt ||
      (user.role !== 'admin' &&
        !(
          user.role === 'support' &&
          access === 'read' &&
          ['GET', 'HEAD'].includes(request.method ?? '')
        ))
    )
      throw new ForbiddenException(
        'Administration réservée aux administrateurs',
      );
    return true;
  }
}
