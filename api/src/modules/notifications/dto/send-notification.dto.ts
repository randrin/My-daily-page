import { NotifChannel } from '@entities/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

const toNotifChannel = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

export class SendNotificationDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @ApiProperty({
    enum: ['email', 'sms', 'whatsapp'],
    example: 'email',
  })
  @IsEnum(NotifChannel)
  @Transform(toNotifChannel)
  channel: NotifChannel;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email, numéro SMS ou identifiant WhatsApp selon le canal',
  })
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @ApiPropertyOptional({ example: 'Rappel de tâche' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ example: 'Votre tâche arrive à échéance demain.' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({ example: '2026-07-15T09:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  triggerAt?: string;
}
