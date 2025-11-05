import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { StripeWebhookController } from './stripe-webhook.controller';

@Module({
  controllers: [BookingController, StripeWebhookController],
  providers: [BookingService]
})
export class BookingModule {}
