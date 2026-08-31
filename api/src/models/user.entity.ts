import type { PrismaUser } from './prisma.types';

type SafeUserJson = Omit<PrismaUser, 'password'>;

export class UserEntity implements PrismaUser {
  id: string;
  email: string;
  phoneNumber: string | null;
  whatsappNumber: string | null;
  password: string;
  timezone: string;
  createdAt: Date;

  constructor(data: Partial<UserEntity>) {
    Object.assign(this, data);
  }

  static fromPrisma(this: void, data: PrismaUser): UserEntity {
    return new UserEntity(data);
  }

  /** Exclut le mot de passe pour les réponses API. */
  toSafeJSON(): SafeUserJson {
    const safe = { ...this };
    delete safe.password;
    return safe;
  }
}
