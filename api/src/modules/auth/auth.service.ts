import { Optional } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { ensureUserContactsUnique } from '../../common/utils/user-contacts';
import { rethrowUserConflict } from '../../common/utils/user-conflict';
import {
  BadRequestException,
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
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
    @Optional() private readonly mfa?: MfaService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    await ensureUserContactsUnique(this.users, dto);
    const user = this.users.create({
      email: dto.email,
      firstName: dto.firstName?.trim() || null,
      lastName: dto.lastName?.trim() || null,
      password: await bcrypt.hash(dto.password, 10),
      phoneNumber: dto.phoneNumber ?? null,
      whatsappNumber: dto.whatsappNumber ?? null,
      timezone: dto.timezone ?? 'Europe/Paris',
      locale: dto.locale ?? 'fr',
    });

    const saved = await this.users.save(user).catch(rethrowUserConflict);
    return this.buildAuthResponse(saved);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.suspendedAt)
      throw new UnauthorizedException({
        message: 'Account suspended',
        code: 'ACCOUNT_SUSPENDED',
      });
    if (user.mfaEnabled) {
      if (!dto.code)
        throw new UnauthorizedException({
          code: 'MFA_REQUIRED',
          message: 'Second facteur requis',
        });
      if (!this.mfa) throw new UnauthorizedException('MFA unavailable');
      await this.mfa.verify(user.id, dto.code);
    }
    return this.buildAuthResponse(user);
  }

  async me(userId: string) {
    return instanceToPlain(await this.requireUser(userId));
  }

  async updateTaskSettings(userId: string, defaultDeadlineDays: number | null) {
    const user = await this.requireUser(userId);
    user.defaultDeadlineDays = defaultDeadlineDays;
    await this.users.save(user);
    return { defaultDeadlineDays: user.defaultDeadlineDays };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.requireUser(userId);

    if (dto.email && dto.email !== user.email) {
      await ensureUserContactsUnique(this.users, { email: dto.email }, userId);
      const taken = await this.users.findOne({ where: { email: dto.email } });
      if (taken) {
        throw new ConflictException('Email already in use');
      }
      user.email = dto.email;
    }

    if (dto.firstName !== undefined)
      user.firstName = emptyToNull(dto.firstName);
    if (dto.lastName !== undefined) user.lastName = emptyToNull(dto.lastName);

    await ensureUserContactsUnique(
      this.users,
      { phoneNumber: dto.phoneNumber, whatsappNumber: dto.whatsappNumber },
      userId,
    );

    if (dto.phoneNumber !== undefined) {
      user.phoneNumber = emptyToNull(dto.phoneNumber);
    }
    if (dto.whatsappNumber !== undefined) {
      user.whatsappNumber = emptyToNull(dto.whatsappNumber);
    }
    if (dto.locale !== undefined) user.locale = dto.locale;
    if (dto.timezone !== undefined) {
      user.timezone = dto.timezone.trim() || 'Europe/Paris';
    }

    const saved = await this.users.save(user).catch(rethrowUserConflict);
    return instanceToPlain(saved);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.requireUser(userId);

    if (!(await bcrypt.compare(dto.currentPassword, user.password))) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.users.save(user);

    return { updated: true };
  }

  async refresh(rawToken: string) {
    const stored = await this.refreshTokens.findOne({
      where: {
        tokenHash: hashToken(rawToken),
        revokedAt: IsNull(),
      },
      relations: { user: true },
    });

    if (
      !stored ||
      stored.expiresAt.getTime() <= Date.now() ||
      stored.user.suspendedAt ||
      (stored.sessionVersion ?? 0) !== (stored.user.sessionVersion ?? 0)
    ) {
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

  private async requireUser(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  private async buildAuthResponse(user: User) {
    if (user.suspendedAt)
      throw new UnauthorizedException({
        message: 'Account suspended',
        code: 'ACCOUNT_SUSPENDED',
      });
    const accessTtl = durationToMs(
      this.config.get<string>('jwt.accessExpiresIn') ?? '15m',
      15 * 60_000,
    );
    const refreshTtl = durationToMs(
      this.config.get<string>('jwt.refreshExpiresIn') ?? '7d',
      7 * 86_400_000,
    );

    const access_token = await this.jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        typ: 'access',
        ver: user.sessionVersion ?? 0,
      },
      { expiresIn: Math.floor(accessTtl / 1000) },
    );

    const refresh_token = randomBytes(48).toString('base64url');
    await this.refreshTokens.save(
      this.refreshTokens.create({
        userId: user.id,
        sessionVersion: user.sessionVersion ?? 0,
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

function emptyToNull(value: string | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}
