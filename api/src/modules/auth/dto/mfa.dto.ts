import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
export class MfaPasswordDto {
  @IsString() @MinLength(8) @MaxLength(256) password: string;
}
export class MfaConfirmDto {
  @IsString() @Matches(/^\d{6}$/) code: string;
}
export class MfaDisableDto extends MfaPasswordDto {
  @IsString() @MinLength(6) @MaxLength(64) code: string;
}
