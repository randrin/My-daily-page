import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class TasksRangeQueryDto {
  @ApiPropertyOptional({
    example: '2026-08-23T00:00:00.000Z',
    description:
      'Début de période (createdAt). Optionnel : sans bornes, toutes les tâches sont renvoyées.',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-09-23T23:59:59.999Z',
    description: 'Fin de période (createdAt). Optionnel.',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
