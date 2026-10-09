import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  Matches,
  IsOptional,
  IsISO8601,
  IsTimeZone,
  ValidateIf,
} from 'class-validator';

export class UpdateDailySettingsDto {
  @ApiPropertyOptional()
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsBoolean()
  smartQuietHoursEnabled?: boolean;

  @ApiPropertyOptional()
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsBoolean()
  adaptiveEscalationEnabled?: boolean;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Suspendre tous les rappels jusqu’à cet instant',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  @Matches(/T.*(?:Z|[+-]\d{2}:\d{2})$/)
  notificationsPausedUntil?: string | null;

  @ApiPropertyOptional({
    description: 'Fuseau du profil utilisé pour le voyage et les rappels',
  })
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsTimeZone()
  timezone?: string;

  @ApiProperty()
  @IsBoolean()
  dailyDigestEnabled: boolean;

  @ApiProperty()
  @IsBoolean()
  quietHoursEnabled: boolean;

  @ApiProperty({ example: '22:00' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  quietHoursStart: string;

  @ApiProperty({ example: '07:00' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  quietHoursEnd: string;

  @ApiProperty()
  @IsBoolean()
  quietHoursAllowUrgent: boolean;
}
