import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { NotifChannel } from '@entities/enums';
export class AdminNotificationsDto {
  @IsOptional() @Type(() => Number) @IsIn([7, 30, 90]) days = 7;
  @IsOptional() @IsEnum(NotifChannel) channel?: NotifChannel;
  @IsOptional()
  @IsIn(['resend', 'twilio', 'ultramsg', 'push', 'unknown'])
  provider?: string;
  @IsOptional() @IsEnum(NotifChannel) failureChannel?: NotifChannel;
  @IsOptional()
  @IsIn(['resend', 'twilio', 'ultramsg', 'push', 'unknown'])
  failureProvider?: string;
  @IsOptional()
  @IsIn(['failed', 'complained', 'sending'])
  failureStatus?: string;
  @IsOptional()
  @IsIn(['user', 'channel', 'provider', 'status', 'attempts', 'triggerAt'])
  sortBy = 'triggerAt';
  @IsOptional() @IsIn(['asc', 'desc']) sortDirection: 'asc' | 'desc' = 'desc';
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1000000) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 10;
}
