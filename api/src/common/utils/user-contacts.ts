import { ConflictException } from '@nestjs/common';
import { Not, Raw, Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

export async function ensureUserContactsUnique(
  users: Repository<User>,
  contacts: { email?: string; phoneNumber?: string | null; whatsappNumber?: string | null },
  userId?: string,
): Promise<void> {
  for (const field of ['email', 'phoneNumber', 'whatsappNumber'] as const) {
    const value = contacts[field];
    if (!value?.trim()) continue;
    const normalized = field === 'email' ? value.trim().toLowerCase() : value.replace(/\D/g, '').replace(/^00/, '');
    const existing = await users.findOne({ where: {
      ...(userId ? { id: Not(userId) } : {}),
      [field]: Raw((alias) => field === 'email'
        ? `lower(trim(${alias})) = :contactValue`
        : `regexp_replace(regexp_replace(${alias}, '[^0-9]', '', 'g'), '^00', '') = :contactValue`, { contactValue: normalized }),
    } });
    if (existing && existing.id !== userId) {
      const label = field === 'email' ? 'Email' : field === 'phoneNumber' ? 'Phone number' : 'WhatsApp number';
      throw new ConflictException(`${label} already in use`);
    }
  }
}
