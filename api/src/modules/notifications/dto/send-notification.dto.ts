import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { NotifChannel } from '@prisma/client';
import { Transform } from 'class-transformer';

const toNotifChannel = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

export class SendNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @IsEnum(NotifChannel)
  @Transform(toNotifChannel)
  channel: NotifChannel;

  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsDateString()
  @IsOptional()
  triggerAt?: string;
}
