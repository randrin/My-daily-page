import { NotifChannel } from '@entities/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum } from 'class-validator';

const toNotifChannel = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

export class CreateReminderDto {
  @ApiProperty({ example: '2026-07-15T09:00:00.000Z' })
  @IsDateString()
  triggerAt: string;

  @ApiProperty({
    enum: ['email', 'sms', 'whatsapp'],
    example: 'email',
    description: 'Canal d’envoi. Valeurs aussi acceptées : EMAIL, SMS, WHATSAPP.',
  })
  @IsEnum(NotifChannel)
  @Transform(toNotifChannel)
  channel: NotifChannel;
}
