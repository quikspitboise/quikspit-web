import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  message: string;
}
