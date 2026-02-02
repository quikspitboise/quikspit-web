import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    HttpCode,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto, SendInvoiceDto } from './dto/create-invoice.dto';
import { LoggerService } from '../common/logger.service';

/**
 * Invoice Controller
 * 
 * REST endpoints for creating and managing Stripe invoices.
 * 
 * Endpoints:
 * - POST /api/invoices - Create a new invoice (draft or send immediately)
 * - POST /api/invoices/:id/send - Finalize and send a draft invoice
 * - GET /api/invoices/:id - Retrieve invoice details
 * - GET /api/invoices/config - Get current invoice configuration
 */
@Controller('invoices')
export class InvoiceController {
    constructor(
        private readonly invoiceService: InvoiceService,
        private readonly logger: LoggerService,
    ) { }

    /**
     * Create a new invoice
     * 
     * By default, creates a draft invoice. Set createAsDraft: false to send immediately.
     */
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createInvoice(@Body() dto: CreateInvoiceDto) {
        this.logger.log('Creating invoice', {
            customerName: dto.customerName,
            lineItemCount: dto.lineItems?.length || 0,
            createAsDraft: dto.createAsDraft,
        });

        if (!this.invoiceService.isAvailable()) {
            throw new BadRequestException('Invoice service is not available. Check Stripe configuration.');
        }

        const result = await this.invoiceService.createInvoice(dto);

        return {
            success: true,
            message: dto.createAsDraft !== false
                ? 'Draft invoice created successfully'
                : 'Invoice created and sent successfully',
            data: result,
        };
    }

    /**
     * Finalize and send a draft invoice
     */
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    @Post(':id/send')
    @HttpCode(HttpStatus.OK)
    async sendInvoice(
        @Param('id') invoiceId: string,
        @Body() body: Omit<SendInvoiceDto, 'invoiceId'>,
    ) {
        this.logger.log('Sending invoice', { invoiceId });

        if (!this.invoiceService.isAvailable()) {
            throw new BadRequestException('Invoice service is not available. Check Stripe configuration.');
        }

        const dto: SendInvoiceDto = {
            invoiceId,
            ...body,
        };

        const result = await this.invoiceService.sendInvoice(dto);

        return {
            success: true,
            message: 'Invoice sent successfully',
            data: result,
        };
    }

    /**
     * Get invoice details by ID
     */
    @Get(':id')
    async getInvoice(@Param('id') invoiceId: string) {
        this.logger.log('Retrieving invoice', { invoiceId });

        if (!this.invoiceService.isAvailable()) {
            throw new BadRequestException('Invoice service is not available. Check Stripe configuration.');
        }

        const invoice = await this.invoiceService.getInvoice(invoiceId);

        if (!invoice) {
            throw new BadRequestException('Invoice not found');
        }

        return {
            success: true,
            data: {
                id: invoice.id,
                number: invoice.number,
                status: invoice.status,
                total: (invoice.total || 0) / 100,
                amountDue: (invoice.amount_due || 0) / 100,
                amountPaid: (invoice.amount_paid || 0) / 100,
                hostedInvoiceUrl: invoice.hosted_invoice_url,
                pdfUrl: invoice.invoice_pdf,
                created: invoice.created,
                dueDate: invoice.due_date,
            },
        };
    }

    /**
     * Get current invoice configuration
     */
    @Get('config')
    getConfig() {
        return {
            success: true,
            data: this.invoiceService.getConfig(),
        };
    }
}
