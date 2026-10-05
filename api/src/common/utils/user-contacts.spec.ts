import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { ensureUserContactsUnique } from './user-contacts';

describe('User contact uniqueness', () => {
  const findOne = jest.fn();
  const users = { findOne } as unknown as Repository<User>;
  beforeEach(() => findOne.mockReset());

  it.each(['email', 'phoneNumber', 'whatsappNumber'])('rejects another user with the same %s', async (field) => {
    findOne.mockResolvedValue({ id: 'other' });
    await expect(ensureUserContactsUnique(users, { [field]: field === 'email' ? 'test@example.com' : '+33612345678' }, 'self')).rejects.toBeInstanceOf(ConflictException);
  });

  it('allows own phone and WhatsApp to match', async () => {
    findOne.mockResolvedValue(null);
    await expect(ensureUserContactsUnique(users, { phoneNumber: '+33612345678', whatsappNumber: '+33612345678' }, 'self')).resolves.toBeUndefined();
    expect(findOne).toHaveBeenCalledTimes(2);
  });

  it('ignores optional empty WhatsApp', async () => {
    await ensureUserContactsUnique(users, { whatsappNumber: null }, 'self');
    expect(findOne).not.toHaveBeenCalled();
  });
});
