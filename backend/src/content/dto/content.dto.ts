import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  Equals,
  IsArray,
  IsBoolean,
  IsDefined,
  IsEmail,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export const SECTION_TYPES = [
  'hero',
  'rich-text',
  'services',
  'steps',
  'reviews',
  'social',
  'cta',
  'faq',
  'gallery',
  'contact',
  'booking',
  'owner',
] as const;

export class LinkDto {
  @IsString() @MaxLength(160) label!: string;
  @IsString() @MaxLength(2048) href!: string;
}

export class MetadataDto {
  @IsString() @MaxLength(200) title!: string;
  @IsString() @MaxLength(1000) description!: string;
  @IsOptional() @IsString() @MaxLength(200) socialTitle?: string;
  @IsOptional() @IsString() @MaxLength(1000) socialDescription?: string;
  @IsOptional() @IsString() @MaxLength(2048) socialImageUrl?: string;
  @IsOptional() @IsBoolean() noIndex?: boolean;
}

export class SectionDto {
  @IsString() @Matches(/^[a-z][a-z0-9-]{0,79}$/) id!: string;
  @IsIn(SECTION_TYPES) type!: (typeof SECTION_TYPES)[number];
  @IsBoolean() enabled!: boolean;
  // Plain JSON for copy, lists, links, image references, and catalog references.
  // Validated recursively in content.validation.ts; never executable markup.
  @IsObject() fields!: Record<string, unknown>;
}

export class PageContentDto {
  @Equals(1) schemaVersion!: 1;
  @IsString() @MaxLength(160) title!: string;
  @IsDefined()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata!: MetadataDto;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ArrayUnique((section: SectionDto) => section?.id)
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections!: SectionDto[];
}

export class BusinessDto {
  @IsString() @MaxLength(160) name!: string;
  @IsString() @Matches(/^\+[1-9]\d{7,14}$/) phone!: string;
  @IsString() @MaxLength(80) phoneDisplay!: string;
  @IsEmail() @MaxLength(254) email!: string;
  @IsString() @MaxLength(500) serviceArea!: string;
  @IsString() @MaxLength(500) hours!: string;
  @IsString() @MaxLength(1000) locationNote!: string;
}

export class SiteContentDto {
  @Equals(1) schemaVersion!: 1;
  @IsDefined()
  @ValidateNested()
  @Type(() => BusinessDto)
  business!: BusinessDto;
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  navigation!: LinkDto[];
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  footerLinks!: LinkDto[];
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  socialLinks!: LinkDto[];
  @IsDefined() @ValidateNested() @Type(() => LinkDto) bookingLink!: LinkDto;
  @IsDefined()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata!: MetadataDto;
  @IsObject() copy!: Record<string, unknown>;
}

export class DurationDto {
  @IsInt() @Min(0) @Max(10080) minMinutes!: number;
  @IsInt() @Min(0) @Max(10080) maxMinutes!: number;
}

export class PackageDto {
  @IsString() @Matches(/^[a-z][a-z0-9-]{0,79}$/) id!: string;
  @IsString() @MaxLength(160) name!: string;
  @IsString() @MaxLength(500) tagline!: string;
  @IsString() @MaxLength(2000) description!: string;
  @IsInt() @Min(0) @Max(100000000) basePriceCents!: number;
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  features!: string[];
  @IsBoolean() enabled!: boolean;
  @IsBoolean() highlight!: boolean;
  @IsBoolean() bestValue!: boolean;
  @IsBoolean() ceramicEligible!: boolean;
  @IsDefined()
  @ValidateNested()
  @Type(() => DurationDto)
  duration!: DurationDto;
}

export class CategoryDto {
  @IsString() @Matches(/^[a-z][a-z0-9-]{0,79}$/) id!: string;
  @IsString() @MaxLength(160) label!: string;
  @IsString() @MaxLength(2000) blurb!: string;
  @IsBoolean() enabled!: boolean;
  @IsString() @Matches(/^[a-z0-9][a-z0-9-]{0,99}$/) calEventSlug!: string;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ArrayUnique((pkg: PackageDto) => pkg?.id)
  @ValidateNested({ each: true })
  @Type(() => PackageDto)
  packages!: PackageDto[];
}

export class VehicleSizeDto {
  @IsString() @Matches(/^[a-z][a-z0-9-]{0,79}$/) id!: string;
  @IsString() @MaxLength(160) label!: string;
  @IsInt() @Min(0) @Max(100000000) surchargeCents!: number;
  @IsBoolean() enabled!: boolean;
}

export class AddonDto {
  @IsString() @Matches(/^[a-z][a-z0-9-]{0,79}$/) id!: string;
  @IsString() @MaxLength(160) name!: string;
  @IsString() @MaxLength(2000) description!: string;
  @IsInt() @Min(0) @Max(100000000) priceCents!: number;
  @IsBoolean() enabled!: boolean;
}

export class CeramicServiceDto extends AddonDto {
  @IsIn(['coating', 'correction']) kind!: 'coating' | 'correction';
  @IsOptional() @IsString() @MaxLength(80) includedCorrectionId?: string;
  @IsOptional() @IsString() @MaxLength(1000) note?: string;
  @IsDefined()
  @ValidateNested()
  @Type(() => DurationDto)
  duration!: DurationDto;
}

export class CatalogContentDto {
  @Equals(1) schemaVersion!: 1;
  @Equals('USD') currency!: 'USD';
  @IsString() @Matches(/^[a-z0-9][a-z0-9-]{0,99}$/) calUsername!: string;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ArrayUnique((category: CategoryDto) => category?.id)
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories!: CategoryDto[];
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ArrayUnique((size: VehicleSizeDto) => size?.id)
  @ValidateNested({ each: true })
  @Type(() => VehicleSizeDto)
  vehicleSizes!: VehicleSizeDto[];
  @IsArray()
  @ArrayMaxSize(50)
  @ArrayUnique((addon: AddonDto) => addon?.id)
  @ValidateNested({ each: true })
  @Type(() => AddonDto)
  addons!: AddonDto[];
  @IsArray()
  @ArrayMaxSize(30)
  @ArrayUnique((service: CeramicServiceDto) => service?.id)
  @ValidateNested({ each: true })
  @Type(() => CeramicServiceDto)
  ceramicServices!: CeramicServiceDto[];
}

export class ExpectedVersionDto {
  @IsInt() @Min(1) @Max(2147483646) expectedVersion!: number;
}

export class SaveContentDraftDto extends ExpectedVersionDto {
  @IsObject() value!: Record<string, unknown>;
}

export class CreatePageDto {
  @IsString() @Matches(/^[a-z][a-z0-9-]{0,79}$/) slug!: string;
  @IsObject() value!: Record<string, unknown>;
}

export class RestoreContentDto extends ExpectedVersionDto {
  @IsUUID() revisionId!: string;
}

export class ReorderSectionsDto extends ExpectedVersionDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ArrayUnique()
  @IsString({ each: true })
  ids!: string[];
}

export class RevisionQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100000) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}

export class QuoteDto {
  @IsString() @MaxLength(80) categoryId!: string;
  @IsString() @MaxLength(80) packageId!: string;
  @IsString() @MaxLength(80) vehicleSizeId!: string;
  @IsArray()
  @ArrayMaxSize(50)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  addonIds!: string[];
  @IsOptional() @IsString() @MaxLength(80) coatingId?: string;
  @IsOptional() @IsString() @MaxLength(80) correctionId?: string;
  @IsOptional() @IsUUID() catalogRevisionId?: string;
}

export type ContentValue = SiteContentDto | CatalogContentDto | PageContentDto;
export type ContentKind = 'site' | 'catalog' | 'page';
