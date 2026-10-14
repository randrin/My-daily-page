import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateIf,
  Equals,
} from 'class-validator';
import { Transform } from 'class-transformer';
export class TaskDefaultsDto {
  @IsIn(['low', 'medium', 'high', 'urgent']) priority: string;
  @ValidateIf((_, value) => value !== null) @IsUUID() categoryId: string | null;
  @IsInt() @Min(0) @Max(10080) reminderLeadMinutes: number;
  @IsIn(['7d', '1m', '2m', '3m']) dashboardPeriod: string;
  @IsIn(['table', 'grid']) taskView: string;
  @IsIn(['title', 'status', 'priority', 'deadline'])
  taskSort: string;
  @IsIn(['asc', 'desc']) sortDirection: string;
}
export class EnabledDto {
  @IsBoolean() enabled: boolean;
}
export class InviteCompanionDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @Length(3, 320)
  email: string;
  @Equals(true) consent: boolean;
}
export class AcceptCompanionDto {
  @Equals(true) consent: boolean;
}
export class CompanionTokenDto {
  @IsString() @Length(64, 64) token: string;
}

export class RespondCompanionDto extends CompanionTokenDto {
  @Equals(true) consent: boolean;
}
