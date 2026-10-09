import { Type, Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class TemplateItemDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 255)
  title: string;
  @IsInt() @Min(0) @Max(3650) dayOffset: number;
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) time: string;
  @IsBoolean() enabled: boolean;
}
export class SaveTemplateDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 120)
  name: string;
  @IsString() @MaxLength(2000) description: string;
  @IsBoolean() enabled: boolean;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => TemplateItemDto)
  items: TemplateItemDto[];
}
export class UpdateTemplateDto extends PartialType(SaveTemplateDto, {
  skipNullProperties: false,
}) {}
export class SuggestTemplateDto {
  @IsOptional() @IsIn(['guided', 'ai']) mode?: 'guided' | 'ai';
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 120)
  name: string;
  @IsString() @MaxLength(2000) description: string;
}
