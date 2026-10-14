import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsInt,
  Min,
  Max,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Priority } from '@entities/enums';
export class SuggestAssistantDto {
  @IsString() @Length(1, 4000) text: string;
  @IsIn(['capture', 'breakdown']) mode: 'capture' | 'breakdown';
  @IsIn(['guided', 'ai']) provider: 'guided' | 'ai';
  @IsIn(['manual', 'email', 'whatsapp', 'voice']) source:
    | 'manual'
    | 'email'
    | 'whatsapp'
    | 'voice';
}
export class ConfirmAssistantItemDto {
  @IsString() @Length(1, 255) title: string;
  @IsDateString() deadline: string;
  @IsEnum(Priority) priority: Priority;
}
export class ConfirmAssistantDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(7, { each: true })
  selectedIndices?: number[];
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => ConfirmAssistantItemDto)
  tasks: ConfirmAssistantItemDto[];
}
export class AiProposalItemDto {
  @IsString() @Length(1, 255) title: string;
  @IsOptional() @IsDateString() deadline: string | null;
  @IsEnum(Priority) priority: Priority;
  @IsString() @MaxLength(500) reason: string;
}
export class AiProposalDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => AiProposalItemDto)
  items: AiProposalItemDto[];
}
