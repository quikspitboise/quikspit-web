import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { HealthController } from './health.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ContactModule } from './contact/contact.module';
import { BookingModule } from './booking/booking.module';
import { GalleryModule } from './gallery/gallery.module';

@Module({
  imports: [ConfigModule.forRoot(), ContactModule, BookingModule, GalleryModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
