import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CloudinaryAssetDto } from './cloudinary-asset.dto';
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

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;

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
