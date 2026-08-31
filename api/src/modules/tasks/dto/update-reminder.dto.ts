import { NotifChannel } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

const toNotifChannel = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

export class UpdateReminderDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsDateString()
  @IsOptional()
  triggerAt?: string;

  @IsEnum(NotifChannel)
  @Transform(toNotifChannel)
  @IsOptional()
  channel?: NotifChannel;
}
