import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class TaskListItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsDateString()
  deadline: string;
}

export class CreateTaskListDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => TaskListItemDto)
  tasks: TaskListItemDto[];
}
