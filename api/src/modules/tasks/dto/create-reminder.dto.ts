import { NotifChannel } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum } from 'class-validator';

const toNotifChannel = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

export class CreateReminderDto {
  @IsDateString()
  triggerAt: string;

  @IsEnum(NotifChannel)
  @Transform(toNotifChannel)
  channel: NotifChannel;
}
