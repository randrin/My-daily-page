import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { instanceToPlain } from 'class-transformer';
import { IsNull, Repository } from 'typeorm';
import { RefreshToken } from '@entities/refresh-token.entity';
import { User } from '@entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const DURATION_MS: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export function durationToMs(value: string, fallbackMs: number): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) return fallbackMs;
  return Number(match[1]) * DURATION_MS[match[2]];
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const user = this.users.create({
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      phoneNumber: dto.phoneNumber ?? null,
      whatsappNumber: dto.whatsappNumber ?? null,
      timezone: dto.timezone ?? 'Europe/Paris',
    });

    const saved = await this.users.save(user);
    return this.buildAuthResponse(saved);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async me(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return instanceToPlain(user);
  }

  async refresh(rawToken: string) {
    const stored = await this.refreshTokens.findOne({
      where: {
        tokenHash: hashToken(rawToken),
        revokedAt: IsNull(),
      },
      relations: { user: true },
    });

    if (!stored || stored.expiresAt.getTime() <= Date.now()) {
      if (stored) {
        stored.revokedAt = new Date();
        await this.refreshTokens.save(stored);
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    stored.revokedAt = new Date();
    await this.refreshTokens.save(stored);

    return this.buildAuthResponse(stored.user);
  }

  async logout(userId: string, rawToken?: string) {
    if (rawToken) {
      const stored = await this.refreshTokens.findOne({
        where: { userId, tokenHash: hashToken(rawToken), revokedAt: IsNull() },
      });
      if (stored) {
        stored.revokedAt = new Date();
        await this.refreshTokens.save(stored);
      }
      return { revoked: true };
    }

    await this.refreshTokens.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
    return { revoked: true };
  }

  private async buildAuthResponse(user: User) {
    const accessTtl = durationToMs(
      this.config.get<string>('jwt.accessExpiresIn') ?? '15m',
      15 * 60_000,
    );
    const refreshTtl = durationToMs(
      this.config.get<string>('jwt.refreshExpiresIn') ?? '7d',
      7 * 86_400_000,
    );

    const access_token = await this.jwt.signAsync(
      { sub: user.id, email: user.email, typ: 'access' },
      { expiresIn: Math.floor(accessTtl / 1000) },
    );

    const refresh_token = randomBytes(48).toString('base64url');
    await this.refreshTokens.save(
      this.refreshTokens.create({
        userId: user.id,
        tokenHash: hashToken(refresh_token),
        expiresAt: new Date(Date.now() + refreshTtl),
      }),
    );

    return {
      access_token,
      refresh_token,
      token_type: 'Bearer' as const,
      expires_in: Math.floor(accessTtl / 1000),
      user: instanceToPlain(user),
    };
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
