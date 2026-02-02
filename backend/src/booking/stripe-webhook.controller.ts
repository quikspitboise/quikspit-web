import { Controller, Post, Req, Headers, BadRequestException, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { LoggerService } from '../common/logger.service';

/**
 * Stripe Webhook Controller
 * 
 * This controller handles webhook events from Stripe to confirm payments securely.
 * 
 * SECURITY BEST PRACTICES:
 * 1. Always verify webhook signatures using STRIPE_WEBHOOK_SECRET
 * 2. Never trust payment status from client - only from webhooks
 * 3. Implement idempotency to handle duplicate events
 * 4. Use raw body parser for signature verification
 * 
 * Setup Instructions:
 * 1. Configure webhook endpoint in Stripe Dashboard: https://dashboard.stripe.com/webhooks
 * 2. Add webhook URL: https://yourdomain.com/api/webhooks/stripe
 * 3. Select events to listen for: payment_intent.succeeded, payment_intent.payment_failed
 * 4. Copy webhook signing secret to STRIPE_WEBHOOK_SECRET in .env
 * 
 * Resources:
 * - Stripe Webhooks: https://stripe.com/docs/webhooks
 * - Webhook Best Practices: https://stripe.com/docs/webhooks/best-practices
 */
@Controller('webhooks/stripe')
export class StripeWebhookController {
  private stripe: Stripe | null = null;
  private isStripeConfigured: boolean = false;

  constructor(private readonly logger: LoggerService) {
    // Initialize Stripe with secret key from environment (optional for now)
    if (!process.env.STRIPE_SECRET_KEY) {
      this.logger.warn('STRIPE_SECRET_KEY is not configured - Stripe webhooks will not be available');
      this.isStripeConfigured = false;
    } else {
      try {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        this.isStripeConfigured = true;
        this.logger.log('Stripe webhook controller initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Stripe', error instanceof Error ? error.message : '');
        this.isStripeConfigured = false;
      }
    }
  }

  @Post()
  async handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    // Check if Stripe is configured
    if (!this.isStripeConfigured || !this.stripe) {
      this.logger.warn('Webhook received but Stripe is not configured');
      throw new BadRequestException('Stripe webhooks are not configured');
    }

    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature to ensure it came from Stripe
      event = this.stripe.webhooks.constructEvent(
        request.rawBody!,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err instanceof Error ? err.message : '');
      throw new BadRequestException('Webhook signature verification failed');
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          this.logger.warn(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error('Error handling webhook event', error instanceof Error ? error.stack : '');
      // Return 200 to prevent Stripe from retrying
      // Log error for manual investigation
    }

    return { received: true };
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const bookingId = paymentIntent.metadata.bookingId;

    this.logger.log('Payment succeeded', {
      paymentIntentId: paymentIntent.id,
      bookingId,
      amount: paymentIntent.amount,
    });

    // TODO: Update booking status in database
    // Example:
    // await this.bookingService.updateBookingStatus(bookingId, 'confirmed');
    // await this.bookingService.sendConfirmationEmail(bookingId);
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const bookingId = paymentIntent.metadata.bookingId;

    this.logger.warn('Payment failed', {
      paymentIntentId: paymentIntent.id,
      bookingId,
      error: paymentIntent.last_payment_error?.message,
    });

    // TODO: Update booking status and notify customer
    // Example:
    // await this.bookingService.updateBookingStatus(bookingId, 'payment_failed');
    // await this.emailService.sendPaymentFailedEmail(bookingId);
  }

  /**
   * Handle completed checkout session
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const bookingId = session.metadata?.bookingId;

    this.logger.log('Checkout session completed', {
      sessionId: session.id,
      bookingId,
      amount: session.amount_total,
    });

    // TODO: Confirm booking and send confirmation
    // Example:
    // await this.bookingService.confirmBooking(bookingId);
  }

  /**
   * Handle paid invoice
   */
  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    const bookingId = invoice.metadata?.bookingId;

    this.logger.log('Invoice paid', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      bookingId,
      amountPaid: invoice.amount_paid,
    });

    // TODO: Update booking status to fully paid
    // Example:
    // await this.bookingService.updateBookingStatus(bookingId, 'paid');
    // await this.emailService.sendPaymentConfirmation(bookingId);
  }

  /**
   * Handle failed invoice payment
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const bookingId = invoice.metadata?.bookingId;

    this.logger.warn('Invoice payment failed', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      bookingId,
      amountDue: invoice.amount_due,
    });

    // TODO: Notify admin and customer about failed payment
    // Example:
    // await this.emailService.sendInvoicePaymentFailed(bookingId);
  }
}
