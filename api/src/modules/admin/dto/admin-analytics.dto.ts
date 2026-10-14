import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsTimeZone } from 'class-validator';
export class AdminAnalyticsDto {
  @IsOptional() @Type(() => Number) @IsIn([7, 30, 90]) days = 30;
  @IsOptional() @IsTimeZone() timezone = 'Europe/Paris';
}
