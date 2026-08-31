import type { NotifChannel, ReminderStatus } from '@prisma/client';
import type { PrismaReminder } from './prisma.types';

export class ReminderEntity implements PrismaReminder {
  id: string;
  taskId: string;
  triggerAt: Date;
  channel: NotifChannel;
  status: ReminderStatus;
  sentAt: Date | null;

  constructor(data: Partial<ReminderEntity>) {
    Object.assign(this, data);
  }

  static fromPrisma(this: void, data: PrismaReminder): ReminderEntity {
    return new ReminderEntity(data);
  }
}

export type { NotifChannel, ReminderStatus };
