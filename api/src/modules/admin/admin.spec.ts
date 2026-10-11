import {
  ExecutionContext,
  ForbiddenException,
  ValidationPipe,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '@entities/user.entity';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { AdminUsersDto } from './dto/admin-users.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';

const context = (id?: string) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user: id ? { id } : undefined }),
    }),
  }) as unknown as ExecutionContext;

describe('Administration access', () => {
  it('denies anonymous, missing and ordinary users', async () => {
    const repository = { findOne: jest.fn().mockResolvedValue(null) };
    const guard = new AdminGuard(repository as unknown as Repository<User>);
    await expect(guard.canActivate(context())).rejects.toThrow(
      ForbiddenException,
    );
    await expect(guard.canActivate(context('missing'))).rejects.toThrow(
      ForbiddenException,
    );
    repository.findOne.mockResolvedValue({ role: 'user' });
    await expect(guard.canActivate(context('user'))).rejects.toThrow(
      ForbiddenException,
    );
  });
  it('checks current database permissions on every call, including revocation', async () => {
    const repository = {
      findOne: jest
        .fn()
        .mockResolvedValueOnce({ role: 'admin' })
        .mockResolvedValueOnce({ role: 'user' }),
    };
    const guard = new AdminGuard(repository as unknown as Repository<User>);
    await expect(guard.canActivate(context('same-token'))).resolves.toBe(true);
    await expect(guard.canActivate(context('same-token'))).rejects.toThrow(
      ForbiddenException,
    );
  });
  it('rejects public role injection and excessive pagination', async () => {
    const pipe = new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    for (const metatype of [RegisterDto, UpdateProfileDto]) {
      await expect(
        pipe.transform({ role: 'admin' }, { type: 'body', metatype }),
      ).rejects.toThrow();
    }
    await expect(
      pipe.transform(
        { pageSize: 101 },
        { type: 'query', metatype: AdminUsersDto },
      ),
    ).rejects.toThrow();
    await expect(
      pipe.transform(
        { page: '2', pageSize: '10' },
        { type: 'query', metatype: AdminUsersDto },
      ),
    ).resolves.toMatchObject({ page: 2, pageSize: 10 });
  });
  it('returns only the admin directory allowlist and aggregate counts', async () => {
    const query = {
      select: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: 'one',
          email: 'user@example.com',
          role: 'user',
          password: 'secret',
          phoneNumber: 'private',
          tasks: [{ title: 'private task' }],
        },
      ]),
    };
    const repository = {
      createQueryBuilder: () => query,
      query: jest
        .fn()
        .mockResolvedValue([{ userId: 'one', tasks: 4, completedTasks: 2 }]),
    };
    const result = await new AdminService(
      repository as unknown as Repository<User>,
    ).list(new AdminUsersDto());
    expect(result.items[0]).toMatchObject({ tasks: 4, completedTasks: 2 });
    expect(JSON.stringify(result)).not.toMatch(
      /secret|private|password|phoneNumber/,
    );
    expect(query.take).toHaveBeenCalledWith(20);
  });
});
