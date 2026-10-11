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
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: { id: string } }>();
    const user =
      request.user &&
      (await this.users.findOne({
        where: { id: request.user.id },
        select: { id: true, role: true },
      }));
    if (!user || user.role !== 'admin')
      throw new ForbiddenException(
        'Administration réservée aux administrateurs',
      );
    return true;
  }
}
