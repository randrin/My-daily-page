import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
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
        email: 'demo@mydailypage.dev',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
