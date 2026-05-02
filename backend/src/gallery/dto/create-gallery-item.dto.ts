import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  MaxLength,
  Min,
} from 'class-validator';
import { GalleryAssetType } from '../entities/gallery-item.entity';
import { CloudinaryAssetDto } from './cloudinary-asset.dto';
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

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;

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

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CloudinaryAssetDto)
  imageAsset?: CloudinaryAssetDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CloudinaryAssetDto)
  beforeAsset?: CloudinaryAssetDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CloudinaryAssetDto)
  afterAsset?: CloudinaryAssetDto;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
