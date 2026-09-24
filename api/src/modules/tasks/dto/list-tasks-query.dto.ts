import { Priority, TaskStatus } from '@entities/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { fromClientPriority, fromClientStatus } from '../task.mapper';

export const TASK_PAGE_SIZES = [10, 20, 50, 100] as const;
export type TaskPageSize = (typeof TASK_PAGE_SIZES)[number];

function splitCsv(value: unknown): string[] {
  if (value == null || value === '') return [];
  const parts = Array.isArray(value)
    ? value.flatMap((item) => String(item).split(','))
    : String(value).split(',');
  return parts.map((item) => item.trim()).filter(Boolean);
}

export class ListTasksQueryDto {
  @ApiPropertyOptional({ example: 'présentation' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;

  @ApiPropertyOptional({
    example: 'todo,in-process',
    description:
      'Statuts client séparés par des virgules (todo, in-process, done, archived).',
  })
  @IsOptional()
  @Transform(({ value }) => {
    const mapped = splitCsv(value)
      .map((item) => fromClientStatus(item))
      .filter((item): item is TaskStatus => Boolean(item));
    return mapped.length ? mapped : undefined;
  })
  @IsArray()
  @IsEnum(TaskStatus, { each: true })
  status?: TaskStatus[];

  @ApiPropertyOptional({
    example: 'high,urgent',
    description: 'Priorités séparées par des virgules (low, medium, high, urgent).',
  })
  @IsOptional()
  @Transform(({ value }) => {
    const mapped = splitCsv(value)
      .map((item) => fromClientPriority(item))
      .filter((item): item is Priority => Boolean(item));
    return mapped.length ? mapped : undefined;
  })
  @IsArray()
  @IsEnum(Priority, { each: true })
  priority?: Priority[];

  @ApiPropertyOptional({
    example: '11111111-1111-1111-1111-111111111111',
    description: 'UUIDs de catégories, séparés par des virgules.',
  })
  @IsOptional()
  @Transform(({ value }) => {
    const ids = splitCsv(value);
    return ids.length ? ids : undefined;
  })
  @IsArray()
  @IsUUID('4', { each: true })
  categoryId?: string[];

  @ApiPropertyOptional({ example: '2026-09-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  deadlineFrom?: string;

  @ApiPropertyOptional({ example: '2026-09-30T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  deadlineTo?: string;

  @ApiPropertyOptional({ example: '2026-09-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({ example: '2026-09-30T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ enum: TASK_PAGE_SIZES, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsIn([...TASK_PAGE_SIZES])
  pageSize?: number;

  @ApiPropertyOptional({
    enum: [
      'status',
      'title',
      'description',
      'priority',
      'category',
      'deadline',
    ],
    example: 'title',
  })
  @IsOptional()
  @IsIn(['status', 'title', 'description', 'priority', 'category', 'deadline'])
  sortBy?:
    | 'status'
    | 'title'
    | 'description'
    | 'priority'
    | 'category'
    | 'deadline';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
