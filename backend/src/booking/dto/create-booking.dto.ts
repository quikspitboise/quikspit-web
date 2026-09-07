import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsInt,
  Min,
  Max,
  ValidateNested,
  IsPhoneNumber,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class VehicleInfoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Transform(trimString)
  make: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Transform(trimString)
  model: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @Transform(trimString)
  color: string;
}

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Transform(trimString)
  customerName: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  @Transform(trimString)
  customerEmail: string;

  @IsPhoneNumber('US')
  @IsNotEmpty()
  @MaxLength(32)
  @Transform(trimString)
  customerPhone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Transform(trimString)
  serviceType: string;

  @IsDateString()
  @IsNotEmpty()
  @MaxLength(40)
  @Transform(trimString)
  preferredDate: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @Transform(trimString)
  preferredTime: string;

  @ValidateNested()
  @Type(() => VehicleInfoDto)
  vehicleInfo: VehicleInfoDto;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(trimString)
  specialRequests?: string;
}
