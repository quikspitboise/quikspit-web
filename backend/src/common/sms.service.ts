import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';

/**
 * SMS Service using Twilio
 * 
 * Provides SMS functionality for sending notifications, including invoice links.
 * 
 * Configuration:
 * - TWILIO_ACCOUNT_SID: Twilio account SID
 * - TWILIO_AUTH_TOKEN: Twilio auth token
 * - TWILIO_PHONE_NUMBER: From phone number
 */
@Injectable()
export class SmsService {
    private twilioClient: any = null;
    private isConfigured: boolean = false;
    private fromNumber: string;

    constructor(private readonly logger: LoggerService) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !phoneNumber) {
            this.logger.warn('Twilio is not configured - SMS functionality will be unavailable');
            this.isConfigured = false;
        } else {
            try {
                // Dynamic import to avoid requiring twilio when not configured
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const twilio = require('twilio');
                this.twilioClient = twilio(accountSid, authToken);
                this.fromNumber = phoneNumber;
                this.isConfigured = true;
                this.logger.log('SMS service initialized successfully');
            } catch (error) {
                this.logger.error('Failed to initialize Twilio', error instanceof Error ? error.message : '');
                this.isConfigured = false;
            }
        }
    }

    /**
     * Check if SMS service is available
     */
    isAvailable(): boolean {
        return this.isConfigured;
    }

    /**
     * Send an SMS message
     * 
     * @param to - Recipient phone number (E.164 format recommended)
     * @param message - Message body (max 1600 characters)
     * @returns Message SID if successful, null if failed or not configured
     */
    async sendSms(to: string, message: string): Promise<string | null> {
        if (!this.isConfigured || !this.twilioClient) {
            this.logger.warn('SMS send attempted but Twilio is not configured');
            return null;
        }

        try {
            const result = await this.twilioClient.messages.create({
                to,
                from: this.fromNumber,
                body: message,
            });

            this.logger.log('SMS sent successfully', {
                messageSid: result.sid,
                to: to.slice(0, 6) + '****' // Log partial number for privacy
            });

            return result.sid;
        } catch (error) {
            this.logger.error('Failed to send SMS', error instanceof Error ? error.message : '');
            return null;
        }
    }

    /**
     * Send an invoice link via SMS
     * 
     * @param to - Recipient phone number
     * @param invoiceUrl - Stripe hosted invoice URL
     * @param customerName - Customer name for personalization
     */
    async sendInvoiceLink(
        to: string,
        invoiceUrl: string,
        customerName?: string
    ): Promise<string | null> {
        const greeting = customerName ? `Hi ${customerName}! ` : '';
        const message = `${greeting}Your QuikSpit Shine invoice is ready. View and pay here: ${invoiceUrl}`;

        return this.sendSms(to, message);
    }
}
