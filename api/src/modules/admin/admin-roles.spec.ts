import { DataSource, EntityManager } from 'typeorm';
import { AdminRolesService } from './admin-roles.service';
import { AdminAuditService } from './admin-audit.service';
import { MfaService } from '../auth/mfa.service';
describe('Controlled role changes', () => {
  const actor = {
    id: 'actor',
    role: 'admin',
    mfaEnabled: true,
    sessionVersion: 3,
  };
  const target = {
    id: 'target',
    role: 'user',
    mfaEnabled: false,
    sessionVersion: 0,
  };
  function fixture() {
    const repo = {
      findOneBy: jest
        .fn()
        .mockImplementation(({ id }: { id: string }) =>
          Promise.resolve(id === 'actor' ? actor : { ...target }),
        ),
      findOne: jest.fn().mockResolvedValue({ ...target }),
      save: jest.fn(),
      update: jest.fn(),
      countBy: jest.fn().mockResolvedValue(1),
    };
    const manager = { getRepository: () => repo } as unknown as EntityManager;
    const mfa = { verify: jest.fn().mockResolvedValue({ sessionVersion: 3 }) };
    const audit = {
      mutate: jest
        .fn()
        .mockImplementation(
          (
            _actor: string,
            _action: string,
            _target: string,
            fn: (m: EntityManager) => Promise<unknown>,
          ) => fn(manager),
        ),
    };
    return {
      repo,
      mfa,
      audit,
      service: new AdminRolesService(
        { getRepository: () => repo } as unknown as DataSource,
        mfa as unknown as MfaService,
        audit as unknown as AdminAuditService,
      ),
    };
  }
  it('audits old/new roles, requires fresh proof and revokes sessions', async () => {
    const f = fixture();
    await f.service.change('actor', 'target', {
      role: 'support',
      password: 'password',
      code: '123456',
    });
    expect(f.mfa.verify).toHaveBeenCalledWith('actor', '123456', 'password');
    expect(f.audit.mutate).toHaveBeenCalledWith(
      'actor',
      'rights.change',
      'target',
      expect.any(Function),
      null,
      {
        before: 'user',
        after: 'support',
      },
    );
    expect(f.repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'support', sessionVersion: 1 }),
    );
    expect(f.repo.update).toHaveBeenCalled();
  });
  it('rejects self-edit, promotion without target MFA and stale proof', async () => {
    const f = fixture(),
      input = { role: 'admin' as const, password: 'password', code: '123456' };
    await expect(f.service.change('actor', 'actor', input)).rejects.toThrow();
    await expect(f.service.change('actor', 'target', input)).rejects.toThrow(
      'MFA',
    );
    f.mfa.verify.mockResolvedValue({ sessionVersion: 2 });
    await expect(
      f.service.change('actor', 'target', { ...input, role: 'support' }),
    ).rejects.toThrow('expirée');
    expect(f.repo.save).not.toHaveBeenCalled();
  });
  it('preserves the last active administrator', async () => {
    const f = fixture();
    f.repo.findOneBy.mockImplementation(({ id }: { id: string }) =>
      Promise.resolve(id === 'actor' ? actor : { ...target, role: 'admin' }),
    );
    f.repo.findOne.mockResolvedValue({ ...target, role: 'admin' });
    await expect(
      f.service.change('actor', 'target', {
        role: 'support',
        password: 'password',
        code: '123456',
      }),
    ).rejects.toThrow('dernier administrateur');
    expect(f.repo.save).not.toHaveBeenCalled();
  });
});
