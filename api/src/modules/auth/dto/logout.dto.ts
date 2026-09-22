import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LogoutDto {
  @ApiPropertyOptional({
    description: 'Si omis, tous les refresh tokens de l’utilisateur sont révoqués',
  })
  @IsString()
  @IsOptional()
  refresh_token?: string;
}
