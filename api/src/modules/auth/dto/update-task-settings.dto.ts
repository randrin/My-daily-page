import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, ValidateIf, IsDefined } from 'class-validator';
export class UpdateTaskSettingsDto {
  @ApiProperty({ nullable: true, minimum: 0, maximum: 3650 })
  @ValidateIf((_, value) => value !== null)
  @IsDefined()
  @IsInt()
  @Min(0)
  @Max(3650)
  defaultDeadlineDays: number | null;
}
