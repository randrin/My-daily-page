import {
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
  ) {}

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
    const preference = this.preferences.create({
      userId,
      channel: dto.channel,
      enabled: dto.enabled ?? true,
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
