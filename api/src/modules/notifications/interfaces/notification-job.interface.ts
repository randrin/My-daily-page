import { NotifChannel } from '@entities/enums';

export interface NotificationJobPayload {
  reminderId: string;
  channel: NotifChannel;
  recipient: string;
  subject?: string;
  body: string;
}
