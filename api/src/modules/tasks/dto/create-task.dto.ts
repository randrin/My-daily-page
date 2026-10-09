import { Priority, TaskStatus } from '@entities/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsDateString,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreateReminderDto } from './create-reminder.dto';
import { fromClientStatus } from '../task.mapper';

const toPriority = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

const toTaskStatus = ({ value }: TransformFnParams): unknown => {
  return typeof value === 'string' ? (fromClientStatus(value) ?? value) : value;
};

export class CreateTaskDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{1,10}(?:\.\d{1,2})?$/)
  amount?: string | null;

  @ValidateIf((_, value) => value !== undefined)
  @IsIn(['EUR', 'USD', 'XAF'])
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string | null;

  @ApiProperty({ example: 'Préparer la réunion' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Slides et ordre du jour' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: ['todo', 'in-process', 'blocked', 'done', 'archived'],
    example: 'todo',
    description:
      'Aussi accepté : TODO, IN_PROGRESS, BLOCKED, in-progress. Réponses toujours en minuscules client. `blocked` exige `blockerIds`.',
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

  @ApiProperty({ example: '2026-07-15T10:00:00.000Z' })
  @IsDefined({ message: 'deadline is required' })
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    type: [String],
    format: 'uuid',
    description:
      'Tâches (children) qui bloquent celle-ci. Obligatoire si status = blocked.',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(50)
  @IsOptional()
  blockerIds?: string[];

  @ApiPropertyOptional({ enum: ['monthly'], nullable: true })
  @IsIn(['monthly'])
  @IsOptional()
  recurrence?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'http://localhost:9000/my-daily-page/task-image/…/photo.jpg',
    description:
      'URL publique MinIO renvoyée par POST /files (kind=task-image). Null pour retirer l’image.',
  })
  @Transform(({ value }: { value: unknown }) => (value === '' ? null : value))
  @IsOptional()
  @ValidateIf((_, value) => value != null)
  @IsString()
  @MaxLength(2048)
  imageUrl?: string | null;

  @ApiPropertyOptional({ type: [CreateReminderDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReminderDto)
  @IsOptional()
  reminders?: CreateReminderDto[];
}
