import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactModule } from './contact/contact.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [ContactModule, BookingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
