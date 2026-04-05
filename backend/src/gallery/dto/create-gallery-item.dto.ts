import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { GalleryAssetType } from '../entities/gallery-item.entity';
import {
  normalizeOptionalString,
  normalizeRequiredString,
  parseStringArrayInput,
} from './transformers';

export class CreateGalleryItemDto {
  @Transform(({ value }) => normalizeRequiredString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsString()
  description?: string;

  @Transform(({ value }) => parseStringArrayInput(value))
  @IsArray()
  @IsString({ each: true })
  categories!: string[];

  @Transform(({ value }) => parseStringArrayInput(value))
  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsEnum(GalleryAssetType)
  assetType!: GalleryAssetType;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
