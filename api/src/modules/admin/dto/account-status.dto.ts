import { IsBoolean, IsIn, IsOptional } from 'class-validator';
export class AccountStatusDto {
  @IsBoolean() suspended: boolean;
  @IsOptional() @IsIn(['security', 'abuse', 'user_request', 'other']) reason?:
    | 'security'
    | 'abuse'
    | 'user_request'
    | 'other';
}
