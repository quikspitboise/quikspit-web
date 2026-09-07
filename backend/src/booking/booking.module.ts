import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { StripeWebhookController } from './stripe-webhook.controller';

@Module({
  imports: [AuthModule],
  controllers: [BookingController, StripeWebhookController],
  providers: [BookingService],
})
export class BookingModule {}
