import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsUUID, Matches } from 'class-validator';

export class TaskConflictsQueryDto {
  @ApiProperty({
    description: 'Échéance à vérifier, avec fuseau explicite',
    example: '2026-10-08T09:00:00.000Z',
  })
  @IsISO8601({ strict: true })
  @Matches(/T.*(?:Z|[+-]\d{2}:\d{2})$/)
  deadline: string;

  @ApiPropertyOptional({ description: 'Tâche en cours d’édition, à exclure' })
  @IsOptional()
  @IsUUID()
  excludeId?: string;
}
