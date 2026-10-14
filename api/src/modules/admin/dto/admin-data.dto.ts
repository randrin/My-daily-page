import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { MfaDisableDto } from '../../auth/dto/mfa.dto';
export class AdminExportDto extends MfaDisableDto {
  @IsOptional() @IsIn(['user', 'support', 'admin']) role?:
    | 'user'
    | 'support'
    | 'admin';
  @IsOptional() @IsIn(['active', 'suspended']) account?: 'active' | 'suspended';
  @IsISO8601({ strict: true }) from: string;
  @IsISO8601({ strict: true }) to: string;
}
export class RetentionPolicyDto extends MfaDisableDto {
  @Type(() => Number) @IsInt() @Min(365) @Max(3650) auditDays: number;
  @Type(() => Number) @IsInt() @Min(30) @Max(3650) reminderDays: number;
  @Type(() => Number) @IsInt() @Min(1) @Max(365) exportDays: number;
}
export class RetentionHoldDto extends MfaDisableDto {
  @IsIn(['audit', 'reminders', 'exports']) resourceType:
    | 'audit'
    | 'reminders'
    | 'exports';
  @IsUUID() resourceId: string;
  @IsString() @Length(10, 240) reason: string;
}
export class RetentionPurgeDto extends MfaDisableDto {
  @IsUUID() planId: string;
  @IsIn(['PURGER']) confirmation: string;
}
export class AdminDataPageDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 20;
}
