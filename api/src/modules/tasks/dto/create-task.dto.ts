import { Priority, TaskStatus } from '@prisma/client';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { CreateReminderDto } from './create-reminder.dto';
import { fromClientStatus } from '../task.mapper';

const toPriority = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

const toTaskStatus = ({ value }: TransformFnParams): unknown => {
  const status = value as unknown;
  return typeof status === 'string'
    ? (fromClientStatus(status) ?? status)
    : status;
};

export class CreateTaskDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @Transform(toTaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(Priority)
  @Transform(toPriority)
  @IsOptional()
  priority?: Priority;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  recurrence?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReminderDto)
  @IsOptional()
  reminders?: CreateReminderDto[];
}
