import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ minLength: 8, example: 'newPassword123' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ChangePasswordResponseDto {
  @ApiProperty({ example: true })
  updated: boolean;
}
