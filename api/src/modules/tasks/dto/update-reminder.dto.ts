import { NotifChannel } from '@entities/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

const toNotifChannel = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

export class UpdateReminderDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ example: '2026-07-15T09:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  triggerAt?: string;

  @ApiPropertyOptional({
    enum: ['email', 'sms', 'whatsapp'],
    example: 'email',
  })
  @IsEnum(NotifChannel)
  @Transform(toNotifChannel)
  @IsOptional()
  channel?: NotifChannel;
}
