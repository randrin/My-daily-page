import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
  @ApiPropertyOptional({
    example: false,
    description: 'Consentement explicite aux rappels WhatsApp',
  })
  @IsOptional()
  @IsBoolean()
  whatsappOptIn?: boolean;
}
