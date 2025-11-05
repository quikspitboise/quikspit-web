import { IsString, IsNotEmpty, IsEmail, IsOptional, IsInt, Min, Max, ValidateNested, IsPhoneNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class VehicleInfoDto {
  @IsString()
  @IsNotEmpty()
  make: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @IsString()
  @IsNotEmpty()
  color: string;
}

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @IsPhoneNumber('US')
  @IsNotEmpty()
  customerPhone: string;

  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @IsString()
  @IsNotEmpty()
  preferredDate: string; // Could use @IsDateString() for ISO 8601 format

  @IsString()
  @IsNotEmpty()
  preferredTime: string;

  @ValidateNested()
  @Type(() => VehicleInfoDto)
  vehicleInfo: VehicleInfoDto;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}
