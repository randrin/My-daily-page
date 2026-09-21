import { Priority, TaskStatus } from '@entities/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateReminderDto } from './create-reminder.dto';
import { fromClientStatus } from '../task.mapper';

const toPriority = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

const toTaskStatus = ({ value }: TransformFnParams): unknown => {
  return typeof value === 'string'
    ? (fromClientStatus(value) ?? value)
    : value;
};

export class CreateTaskDto {
  @ApiProperty({ example: 'Préparer la réunion' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Slides et ordre du jour' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: ['todo', 'in-process', 'done', 'archived'],
    example: 'todo',
    description:
      'Aussi accepté : TODO, IN_PROGRESS, in-progress. Réponses toujours en minuscules client.',
  })
  @IsEnum(TaskStatus)
  @Transform(toTaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    enum: ['low', 'medium', 'high', 'urgent'],
    example: 'high',
  })
  @IsEnum(Priority)
  @Transform(toPriority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({ example: '2026-07-15T10:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'RRULE:FREQ=WEEKLY;BYDAY=MO' })
  @IsString()
  @IsOptional()
  recurrence?: string;

  @ApiPropertyOptional({ type: [CreateReminderDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReminderDto)
  @IsOptional()
  reminders?: CreateReminderDto[];
}
