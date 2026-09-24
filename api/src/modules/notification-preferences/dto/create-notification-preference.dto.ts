import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { NotifChannel } from '@entities/enums';

const toNotifChannel = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

export class CreateNotificationPreferenceDto {
  @ApiProperty({
    enum: ['email', 'sms', 'whatsapp'],
    example: 'email',
    description:
      'Canal unique par utilisateur. Valeurs aussi acceptées : EMAIL, SMS, WHATSAPP.',
  })
  @IsEnum(NotifChannel)
  @Transform(toNotifChannel)
  channel: NotifChannel;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
