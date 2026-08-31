import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { UpdateReminderDto } from './update-reminder.dto';

export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['reminders'] as const),
) {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateReminderDto)
  @IsOptional()
  reminders?: UpdateReminderDto[];
}
