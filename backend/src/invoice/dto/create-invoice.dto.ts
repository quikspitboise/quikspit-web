import {
    IsString,
    IsNotEmpty,
    IsEmail,
    IsOptional,
    IsArray,
    IsNumber,
    IsBoolean,
    ValidateNested,
    Min,
    IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Individual line item for an invoice
 */
export class InvoiceLineItemDto {
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @Min(0)
    amount: number; // in dollars (will be converted to cents for Stripe)

    @IsOptional()
    @IsNumber()
    @Min(1)
    quantity?: number; // defaults to 1
}

/**
 * DTO for creating a Stripe invoice
 */
export class CreateInvoiceDto {
    @IsString()
    @IsNotEmpty()
    customerName: string;

    @IsOptional()
    @IsEmail()
    customerEmail?: string;

    @IsOptional()
    @IsPhoneNumber()
    customerPhone?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceLineItemDto)
    lineItems: InvoiceLineItemDto[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    depositAmount?: number; // defaults to 50, in dollars

    @IsOptional()
    @IsBoolean()
    sendViaEmail?: boolean; // defaults to true

    @IsOptional()
    @IsBoolean()
    sendViaSms?: boolean; // defaults to false

    @IsOptional()
    @IsNumber()
    @Min(1)
    daysUntilDue?: number; // defaults to 7

    @IsOptional()
    @IsString()
    bookingId?: string; // for linking invoice to a booking

    @IsOptional()
    @IsBoolean()
    createAsDraft?: boolean; // if true, creates draft instead of sending
}

/**
 * DTO for sending/finalizing a draft invoice
 */
export class SendInvoiceDto {
    @IsString()
    @IsNotEmpty()
    invoiceId: string;

    @IsOptional()
    @IsBoolean()
    sendViaEmail?: boolean; // defaults to true

    @IsOptional()
    @IsBoolean()
    sendViaSms?: boolean; // defaults to false

    @IsOptional()
    @IsPhoneNumber()
    customerPhone?: string; // required if sendViaSms is true
}
