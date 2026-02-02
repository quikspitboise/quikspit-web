import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { LoggerService } from '../common/logger.service';
import { SmsService } from '../common/sms.service';
import { CreateInvoiceDto, SendInvoiceDto } from './dto/create-invoice.dto';

/**
 * Invoice creation result
 */
export interface InvoiceResult {
    invoiceId: string;
    invoiceNumber: string | null;
    status: string;
    hostedInvoiceUrl: string | null;
    total: number;
    customerId: string;
    emailSent: boolean;
    smsSent: boolean;
}

/**
 * Configuration for invoice behavior
 * Allows easy modification of default values
 */
export interface InvoiceConfig {
    defaultDepositAmount: number;
    defaultDaysUntilDue: number;
    autoSendOnCreate: boolean;
    defaultSendViaEmail: boolean;
    defaultSendViaSms: boolean;
}

const DEFAULT_CONFIG: InvoiceConfig = {
    defaultDepositAmount: 50,
    defaultDaysUntilDue: 7,
    autoSendOnCreate: false, // Option 3: create draft by default
    defaultSendViaEmail: true,
    defaultSendViaSms: false,
};

/**
 * Stripe Invoice Service
 * 
 * Provides modular invoice functionality with:
 * - Draft invoice creation (after booking)
 * - Invoice finalization/sending (after service)
 * - Email and SMS delivery options
 * - Line item management with deposit deduction
 * 
 * Configuration can be overridden at runtime via setConfig()
 */
@Injectable()
export class InvoiceService {
    private stripe: Stripe | null = null;
    private isStripeConfigured: boolean = false;
    private config: InvoiceConfig = { ...DEFAULT_CONFIG };

    constructor(
        private readonly logger: LoggerService,
        private readonly smsService: SmsService,
    ) {
        if (!process.env.STRIPE_SECRET_KEY) {
            this.logger.warn('STRIPE_SECRET_KEY is not configured - Invoice service will not be available');
            this.isStripeConfigured = false;
        } else {
            try {
                this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
                    apiVersion: '2025-12-15.clover',
                });
                this.isStripeConfigured = true;
                this.logger.log('Invoice service initialized with Stripe');
            } catch (error) {
                this.logger.error('Failed to initialize Stripe for invoices', error instanceof Error ? error.message : '');
                this.isStripeConfigured = false;
            }
        }
    }

    /**
     * Check if invoice service is available
     */
    isAvailable(): boolean {
        return this.isStripeConfigured;
    }

    /**
     * Update configuration at runtime
     * Useful for changing behavior without redeployment
     */
    setConfig(config: Partial<InvoiceConfig>): void {
        this.config = { ...this.config, ...config };
        this.logger.log('Invoice config updated', { config: this.config });
    }

    /**
     * Get current configuration
     */
    getConfig(): InvoiceConfig {
        return { ...this.config };
    }

    /**
     * Create an invoice with line items and deposit deduction
     * 
     * By default creates a draft invoice. Set createAsDraft: false to send immediately.
     * 
     * @param dto - Invoice creation data
     * @returns Invoice result with ID and URLs
     */
    async createInvoice(dto: CreateInvoiceDto): Promise<InvoiceResult> {
        if (!this.stripe) {
            throw new BadRequestException('Stripe is not configured');
        }

        // Validate at least one contact method
        if (!dto.customerEmail && !dto.customerPhone) {
            throw new BadRequestException('Either customerEmail or customerPhone is required');
        }

        // Validate line items
        if (!dto.lineItems || dto.lineItems.length === 0) {
            throw new BadRequestException('At least one line item is required');
        }

        const depositAmount = dto.depositAmount ?? this.config.defaultDepositAmount;
        const createAsDraft = dto.createAsDraft ?? !this.config.autoSendOnCreate;
        const sendViaEmail = dto.sendViaEmail ?? this.config.defaultSendViaEmail;
        const sendViaSms = dto.sendViaSms ?? this.config.defaultSendViaSms;
        const daysUntilDue = dto.daysUntilDue ?? this.config.defaultDaysUntilDue;

        try {
            // 1. Create or retrieve Stripe customer
            const metadata: Record<string, string> = {};
            if (dto.bookingId) {
                metadata.bookingId = dto.bookingId;
            }

            const customerParams: Stripe.CustomerCreateParams = {
                name: dto.customerName,
                metadata,
            };

            if (dto.customerEmail) {
                customerParams.email = dto.customerEmail;
            }
            if (dto.customerPhone) {
                customerParams.phone = dto.customerPhone;
            }

            const customer = await this.stripe.customers.create(customerParams);
            this.logger.log('Created Stripe customer', { customerId: customer.id });

            // 2. Add line items for each service
            for (const item of dto.lineItems) {
                const quantity = item.quantity ?? 1;
                await this.stripe.invoiceItems.create({
                    customer: customer.id,
                    amount: Math.round(item.amount * 100), // Convert to cents
                    description: item.description,
                    currency: 'usd',
                    quantity,
                });
            }

            // 3. Add deposit credit (negative amount) if deposit was paid
            if (depositAmount > 0) {
                await this.stripe.invoiceItems.create({
                    customer: customer.id,
                    amount: -Math.round(depositAmount * 100), // Negative for credit
                    description: `Deposit paid at booking (-$${depositAmount})`,
                    currency: 'usd',
                });
            }

            // 4. Create the invoice
            const invoiceMetadata: Record<string, string> = {};
            if (dto.bookingId) {
                invoiceMetadata.bookingId = dto.bookingId;
            }

            const invoiceParams: Stripe.InvoiceCreateParams = {
                customer: customer.id,
                collection_method: 'send_invoice',
                days_until_due: daysUntilDue,
                auto_advance: !createAsDraft, // Only auto-advance if not creating as draft
                metadata: invoiceMetadata,
            };

            const invoice = await this.stripe.invoices.create(invoiceParams);
            this.logger.log('Created invoice', {
                invoiceId: invoice.id,
                status: invoice.status,
                asDraft: createAsDraft
            });

            let emailSent = false;
            let smsSent = false;

            // 5. Send invoice if not creating as draft
            if (!createAsDraft) {
                const sendResult = await this.finalizeAndSend(invoice.id, sendViaEmail, sendViaSms, dto.customerPhone);
                emailSent = sendResult.emailSent;
                smsSent = sendResult.smsSent;
            }

            // Retrieve final invoice state
            const finalInvoice = await this.stripe.invoices.retrieve(invoice.id);

            return {
                invoiceId: finalInvoice.id,
                invoiceNumber: finalInvoice.number,
                status: finalInvoice.status || 'draft',
                hostedInvoiceUrl: finalInvoice.hosted_invoice_url,
                total: (finalInvoice.total || 0) / 100, // Convert back to dollars
                customerId: customer.id,
                emailSent,
                smsSent,
            };
        } catch (error) {
            this.logger.error('Failed to create invoice', error instanceof Error ? error.stack : '');
            throw new BadRequestException(
                error instanceof Error ? error.message : 'Failed to create invoice'
            );
        }
    }

    /**
     * Finalize and send a draft invoice
     * 
     * @param dto - Send invoice data with options
     * @returns Updated invoice result
     */
    async sendInvoice(dto: SendInvoiceDto): Promise<InvoiceResult> {
        if (!this.stripe) {
            throw new BadRequestException('Stripe is not configured');
        }

        const sendViaEmail = dto.sendViaEmail ?? this.config.defaultSendViaEmail;
        const sendViaSms = dto.sendViaSms ?? this.config.defaultSendViaSms;

        if (sendViaSms && !dto.customerPhone) {
            throw new BadRequestException('customerPhone is required when sendViaSms is true');
        }

        try {
            // Retrieve invoice to get customer info
            const invoice = await this.stripe.invoices.retrieve(dto.invoiceId);

            if (!invoice || typeof invoice.customer !== 'string') {
                throw new BadRequestException('Invoice not found or invalid');
            }

            const sendResult = await this.finalizeAndSend(
                dto.invoiceId,
                sendViaEmail,
                sendViaSms,
                dto.customerPhone
            );

            // Retrieve final invoice state
            const finalInvoice = await this.stripe.invoices.retrieve(dto.invoiceId);

            return {
                invoiceId: finalInvoice.id,
                invoiceNumber: finalInvoice.number,
                status: finalInvoice.status || 'open',
                hostedInvoiceUrl: finalInvoice.hosted_invoice_url,
                total: (finalInvoice.total || 0) / 100,
                customerId: typeof finalInvoice.customer === 'string' ? finalInvoice.customer : '',
                emailSent: sendResult.emailSent,
                smsSent: sendResult.smsSent,
            };
        } catch (error) {
            this.logger.error('Failed to send invoice', error instanceof Error ? error.stack : '');
            throw new BadRequestException(
                error instanceof Error ? error.message : 'Failed to send invoice'
            );
        }
    }

    /**
     * Retrieve an invoice by ID
     */
    async getInvoice(invoiceId: string): Promise<Stripe.Invoice | null> {
        if (!this.stripe) {
            throw new BadRequestException('Stripe is not configured');
        }

        try {
            return await this.stripe.invoices.retrieve(invoiceId);
        } catch (error) {
            this.logger.error('Failed to retrieve invoice', error instanceof Error ? error.message : '');
            return null;
        }
    }

    /**
     * Internal method to finalize and send an invoice
     */
    private async finalizeAndSend(
        invoiceId: string,
        sendViaEmail: boolean,
        sendViaSms: boolean,
        customerPhone?: string,
    ): Promise<{ emailSent: boolean; smsSent: boolean }> {
        if (!this.stripe) {
            throw new BadRequestException('Stripe is not configured');
        }

        let emailSent = false;
        let smsSent = false;

        try {
            // Finalize the invoice first
            await this.stripe.invoices.finalizeInvoice(invoiceId);
            this.logger.log('Invoice finalized', { invoiceId });

            // Send via Stripe email if requested
            if (sendViaEmail) {
                await this.stripe.invoices.sendInvoice(invoiceId);
                emailSent = true;
                this.logger.log('Invoice sent via email', { invoiceId });
            }

            // Send SMS with invoice link if requested
            if (sendViaSms && customerPhone) {
                const invoice = await this.stripe.invoices.retrieve(invoiceId);
                if (invoice.hosted_invoice_url) {
                    const result = await this.smsService.sendInvoiceLink(
                        customerPhone,
                        invoice.hosted_invoice_url,
                    );
                    smsSent = result !== null;
                }
            }
        } catch (error) {
            this.logger.error('Error during invoice send', error instanceof Error ? error.message : '');
            // Don't throw - partial delivery is acceptable
        }

        return { emailSent, smsSent };
    }
}
