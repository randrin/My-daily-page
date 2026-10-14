import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { User } from '@entities/user.entity';
import { AdminGuard } from './admin.guard';
import { ADMIN_ACCESS } from './admin-access.decorator';
describe('Explicit administration permissions', () => {
  const read = () => undefined,
    write = () => undefined;
  Reflect.defineMetadata(ADMIN_ACCESS, 'read', read);
  Reflect.defineMetadata(ADMIN_ACCESS, 'write', write);
  const data = () => undefined;
  Reflect.defineMetadata(ADMIN_ACCESS, 'data', data);
  const context = (method: string, handler = read) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ method, user: { id: 'account', role: 'admin' } }),
      }),
      getHandler: () => handler,
      getClass: () => AdminGuard,
    }) as unknown as ExecutionContext;
  it('allows support only on explicitly declared GET/HEAD reads', async () => {
    const guard = new AdminGuard(
      {
        findOne: jest.fn().mockResolvedValue({ role: 'support' }),
      } as unknown as Repository<User>,
      new Reflector(),
    );
    expect(await guard.canActivate(context('GET'))).toBe(true);
    await expect(guard.canActivate(context('PATCH', write))).rejects.toThrow();
    await expect(guard.canActivate(context('POST'))).rejects.toThrow();
    await expect(guard.canActivate(context('GET', data))).rejects.toThrow();
    await expect(
      guard.canActivate(context('GET', () => undefined)),
    ).rejects.toThrow();
  });
  it('ignores token roles and denies suspended accounts', async () => {
    for (const account of [
      { role: 'user' },
      { role: 'admin', suspendedAt: new Date() },
    ]) {
      const guard = new AdminGuard({
        findOne: jest.fn().mockResolvedValue(account),
      } as unknown as Repository<User>);
      await expect(guard.canActivate(context('GET'))).rejects.toThrow();
    }
  });
});
