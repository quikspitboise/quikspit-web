import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { SmsService } from '../common/sms.service';

/**
 * Invoice Module
 * 
 * Provides Stripe invoice functionality for billing customers.
 * 
 * Features:
 * - Create draft invoices after booking
 * - Finalize and send invoices after service completion
 * - Line item support for packages, add-ons, and services
 * - Deposit deduction
 * - Email and SMS delivery options
 */
@Module({
    controllers: [InvoiceController],
    providers: [InvoiceService, SmsService],
    exports: [InvoiceService, SmsService],
})
export class InvoiceModule { }
