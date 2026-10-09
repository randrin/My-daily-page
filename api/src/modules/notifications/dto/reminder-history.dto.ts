import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { NotifChannel, ReminderStatus } from '@entities/enums';

export class ReminderHistoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000)
  page = 1;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([10, 20, 50, 100])
  pageSize = 20;
  @IsOptional()
  @IsEnum(NotifChannel)
  channel?: NotifChannel;
  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;
  @IsOptional()
  @IsIn(['title', 'channel', 'triggerAt', 'status', 'attempts', 'lastError'])
  sortBy = 'triggerAt';
  @IsOptional()
  @IsIn(['asc', 'desc'])
  direction = 'desc';
}
