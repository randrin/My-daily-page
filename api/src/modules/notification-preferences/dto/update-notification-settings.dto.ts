import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificationSettingsDto {
  @ApiProperty({ description: 'Autoriser les rappels pour cet utilisateur' })
  @IsBoolean()
  notificationsEnabled: boolean;
}
