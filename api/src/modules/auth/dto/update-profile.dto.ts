import { IsTimeZone } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, IsNotEmpty, ValidateIf, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Marie', maxLength: 100 })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @ValidateIf((dto: UpdateProfileDto) => dto.firstName !== undefined)
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Dupont', maxLength: 100 })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @ValidateIf((dto: UpdateProfileDto) => dto.lastName !== undefined)
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+33600000000' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @ValidateIf((dto: UpdateProfileDto) => dto.phoneNumber !== undefined)
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[0-9\s.-]{8,20}$/, { message: 'Invalid phone number' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '+33600000000', nullable: true })
  @IsString()
  @IsOptional()
  whatsappNumber?: string | null;

  @ApiPropertyOptional({ example: 'Europe/Paris' })
  @IsString()
  @IsOptional()
  @IsTimeZone()
  timezone?: string;
}
