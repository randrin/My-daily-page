import { NotifChannel } from '@prisma/client';

export interface NotificationJobPayload {
  reminderId: string;
  channel: NotifChannel;
  recipient: string;
  subject?: string;
  body: string;
}
