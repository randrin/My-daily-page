import { UpdateDailySettingsDto } from './dto/update-daily-settings.dto';
import { User } from '@entities/user.entity';
import { NotifChannel } from '@entities/enums';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { NotificationPreference } from '@entities/notification-preference.entity';
import { CreateNotificationPreferenceDto } from './dto/create-notification-preference.dto';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';

@Injectable()
export class NotificationPreferencesService {
  constructor(
    @InjectRepository(NotificationPreference)
    private readonly preferences: Repository<NotificationPreference>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async settings(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return { notificationsEnabled: user.notificationsEnabled };
  }

  async updateSettings(userId: string, notificationsEnabled: boolean) {
    const result = await this.users.update(
      { id: userId },
      { notificationsEnabled },
    );
    if (!result.affected) throw new NotFoundException('User not found');
    return { notificationsEnabled };
  }

  async dailySettings(userId: string) {
    const user = await this.users.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    return {
      smartQuietHoursEnabled: user.smartQuietHoursEnabled,
      adaptiveEscalationEnabled: user.adaptiveEscalationEnabled,
      dailyDigestEnabled: user.dailyDigestEnabled,
      quietHoursEnabled: user.quietHoursEnabled,
      quietHoursStart: user.quietHoursStart,
      quietHoursEnd: user.quietHoursEnd,
      quietHoursAllowUrgent: user.quietHoursAllowUrgent,
      timezone: user.timezone,
      notificationsPausedUntil:
        user.notificationsPausedUntil &&
        user.notificationsPausedUntil > new Date()
          ? user.notificationsPausedUntil.toISOString()
          : null,
    };
  }

  async updateDailySettings(userId: string, dto: UpdateDailySettingsDto) {
    if (dto.quietHoursStart === dto.quietHoursEnd)
      throw new BadRequestException(
        'Les heures de début et de fin doivent être différentes',
      );
    const { notificationsPausedUntil, ...settings } = dto;
    const pauseEnd = notificationsPausedUntil
      ? new Date(notificationsPausedUntil)
      : null;
    if (pauseEnd && pauseEnd <= new Date())
      throw new BadRequestException(
        'La fin de la pause doit être dans le futur',
      );
    const result = await this.users.update(
      { id: userId },
      {
        ...settings,
        ...(notificationsPausedUntil !== undefined
          ? { notificationsPausedUntil: pauseEnd }
          : {}),
      },
    );
    if (!result.affected) throw new NotFoundException('User not found');
    return this.dailySettings(userId);
  }

  findAll(userId: string): Promise<NotificationPreference[]> {
    return this.preferences.find({
      where: { userId },
      order: { channel: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<NotificationPreference> {
    const preference = await this.preferences.findOne({
      where: { id, userId },
    });
    if (!preference) {
      throw new NotFoundException(
        `Notification preference with id "${id}" not found`,
      );
    }
    return preference;
  }

  async create(
    userId: string,
    dto: CreateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    await this.assertChannel(
      userId,
      dto.channel,
      dto.enabled ?? true,
      dto.whatsappOptIn ?? false,
    );
    const preference = this.preferences.create({
      userId,
      channel: dto.channel,
      enabled: dto.enabled ?? true,
      whatsappOptIn: dto.whatsappOptIn ?? false,
    });

    try {
      return await this.preferences.save(preference);
    } catch (error) {
      this.rethrowConstraint(error);
    }
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    const preference = await this.findOne(id, userId);
    await this.assertChannel(
      userId,
      preference.channel,
      dto.enabled ?? preference.enabled,
      dto.whatsappOptIn ?? preference.whatsappOptIn,
    );
    if (dto.whatsappOptIn !== undefined)
      preference.whatsappOptIn = dto.whatsappOptIn;
    if (dto.enabled !== undefined) {
      preference.enabled = dto.enabled;
    }

    try {
      return await this.preferences.save(preference);
    } catch (error) {
      this.rethrowConstraint(error);
    }
  }

  async remove(id: string, userId: string): Promise<NotificationPreference> {
    const preference = await this.findOne(id, userId);
    await this.preferences.delete({ id: preference.id, userId });
    return preference;
  }

  private async assertChannel(
    userId: string,
    channel: NotifChannel,
    enabled: boolean,
    optIn: boolean,
  ) {
    if (!enabled) return;
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (channel === NotifChannel.SMS && !user.phoneNumber)
      throw new BadRequestException('SMS requires a phone number');
    if (channel === NotifChannel.WHATSAPP && (!user.whatsappNumber || !optIn))
      throw new BadRequestException(
        'WhatsApp requires a number and explicit opt-in',
      );
  }

  private rethrowConstraint(error: unknown): never {
    if (this.isPgCode(error, '23505')) {
      throw new ConflictException(
        'A preference for this channel already exists',
      );
    }
    if (this.isPgCode(error, '23503')) {
      throw new NotFoundException('User not found');
    }
    throw error;
  }

  private isPgCode(error: unknown, code: string): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }
    const driverError = error.driverError as { code?: string } | undefined;
    return driverError?.code === code;
  }
}
