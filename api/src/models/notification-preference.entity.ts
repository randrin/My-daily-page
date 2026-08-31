import type { NotifChannel } from '@prisma/client';
import type { PrismaNotificationPreference } from './prisma.types';

export class NotificationPreferenceEntity implements PrismaNotificationPreference {
  id: string;
  userId: string;
  channel: NotifChannel;
  enabled: boolean;

  constructor(data: Partial<NotificationPreferenceEntity>) {
    Object.assign(this, data);
  }

  static fromPrisma(
    this: void,
    data: PrismaNotificationPreference,
  ): NotificationPreferenceEntity {
    return new NotificationPreferenceEntity(data);
  }
}

export type { NotifChannel };
