import {
  IsOptional,
  IsNumber,
  IsDefined,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
export class PushKeysDto {
  @IsString() @Matches(/^[A-Za-z0-9_-]{87}$/) p256dh: string;
  @IsString() @Matches(/^[A-Za-z0-9_-]{22}$/) auth: string;
}
export class PushSubscriptionDto {
  @IsOptional() @IsNumber() expirationTime?: number | null;
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(2048)
  endpoint: string;
  @IsDefined() @ValidateNested() @Type(() => PushKeysDto) keys: PushKeysDto;
}
export class DeletePushDto {
  @IsString() @MaxLength(2048) endpoint: string;
}
