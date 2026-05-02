import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { normalizeOptionalString, normalizeRequiredString } from './transformers';

export class CloudinaryAssetDto {
  @Transform(({ value }) => normalizeRequiredString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  publicId!: string;

  @Transform(({ value }) => normalizeRequiredString(value))
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  @MaxLength(2048)
  secureUrl!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30000)
  width!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30000)
  height!: number;

  @Transform(({ value }) => normalizeRequiredString(value).toLowerCase())
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  format!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(25 * 1024 * 1024)
  bytes!: number;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(255)
  originalFilename?: string;
}
