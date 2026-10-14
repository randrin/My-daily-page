import { IsIn, IsString, MinLength, MaxLength } from 'class-validator';
export class AdminRoleDto {
  @IsIn(['user', 'support', 'admin']) role: 'user' | 'support' | 'admin';
  @IsString() @MinLength(8) @MaxLength(256) password: string;
  @IsString() @MinLength(6) @MaxLength(64) code: string;
}
