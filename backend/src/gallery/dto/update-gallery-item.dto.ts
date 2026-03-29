import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { normalizeOptionalString, parseStringArrayInput } from './transformers';

export class UpdateGalleryItemDto {
  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsString()
  description?: string;

  @Transform(({ value }) => parseStringArrayInput(value))
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @Transform(({ value }) => parseStringArrayInput(value))
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
