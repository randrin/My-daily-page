import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from '@entities/refresh-token.entity';
import { User } from '@entities/user.entity';
import { AuthService, durationToMs } from './auth.service';

describe('durationToMs', () => {
  it('parse les durées JWT', () => {
    expect(durationToMs('15m', 0)).toBe(15 * 60_000);
    expect(durationToMs('7d', 0)).toBe(7 * 86_400_000);
    expect(durationToMs('bad', 42)).toBe(42);
  });
});

describe('AuthService', () => {
  const users = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const refreshTokens = {
    findOne: jest.fn(),
    create: jest.fn((row: object) => row),
    save: jest.fn(),
    update: jest.fn(),
  };
  const jwt = { signAsync: jest.fn().mockResolvedValue('access.jwt') };
  const config = {
    get: jest.fn((key: string) =>
      key === 'jwt.accessExpiresIn' ? '15m' : '7d',
    ),
  };

  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jwt.signAsync.mockResolvedValue('access.jwt');
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: users },
        { provide: getRepositoryToken(RefreshToken), useValue: refreshTokens },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('refuse un refresh token inconnu', async () => {
    refreshTokens.findOne.mockResolvedValue(null);
    await expect(service.refresh('nope')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('refuse un email déjà utilisé', async () => {
    users.findOne.mockResolvedValue({ id: '1' });
    await expect(
      service.register({
        phoneNumber: '+33612345678',
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'demo@mydailypage.dev',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('met à jour le profil sans changer l’email', async () => {
    const user = {
      id: '1',
      email: 'demo@mydailypage.dev',
      phoneNumber: null,
      whatsappNumber: null,
      timezone: 'Europe/Paris',
    };
    users.findOne.mockResolvedValue(user);
    users.save.mockImplementation(async (row: object) => row);

    const result = await service.updateProfile('1', {
      firstName: ' Marie ',
      lastName: ' Dupont ',
      phoneNumber: '+33600000000',
      timezone: 'Africa/Douala',
    });

    expect(users.findOne).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      email: 'demo@mydailypage.dev',
      firstName: 'Marie',
      lastName: 'Dupont',
      phoneNumber: '+33600000000',
      timezone: 'Africa/Douala',
    });
  });

  it('refuse un email déjà pris sur le profil', async () => {
    users.findOne
      .mockResolvedValueOnce({
        id: '1',
        email: 'demo@mydailypage.dev',
      })
      .mockResolvedValueOnce({ id: '2', email: 'other@example.com' });

    await expect(
      service.updateProfile('1', { email: 'other@example.com' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('refuse un mauvais mot de passe actuel', async () => {
    users.findOne.mockResolvedValue({
      id: '1',
      password: await bcrypt.hash('password123', 4),
    });

    await expect(
      service.changePassword('1', {
        currentPassword: 'wrong-password',
        newPassword: 'newPassword123',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(users.save).not.toHaveBeenCalled();
  });

  it('refuse un nouveau mot de passe identique', async () => {
    users.findOne.mockResolvedValue({
      id: '1',
      password: await bcrypt.hash('password123', 4),
    });

    await expect(
      service.changePassword('1', {
        currentPassword: 'password123',
        newPassword: 'password123',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(users.save).not.toHaveBeenCalled();
  });

  it('hash le nouveau mot de passe', async () => {
    const user = {
      id: '1',
      password: await bcrypt.hash('password123', 4),
    };
    users.findOne.mockResolvedValue(user);
    users.save.mockImplementation(async (row: object) => row);

    await expect(
      service.changePassword('1', {
        currentPassword: 'password123',
        newPassword: 'newPassword123',
      }),
    ).resolves.toEqual({ updated: true });

    expect(await bcrypt.compare('newPassword123', user.password)).toBe(true);
  });
});
