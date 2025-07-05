import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ContactModule } from './contact/contact.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [ConfigModule.forRoot(), ContactModule, BookingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
