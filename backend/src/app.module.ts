import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { HealthController } from './health.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ContactModule } from './contact/contact.module';
import { BookingModule } from './booking/booking.module';
import { GalleryModule } from './gallery/gallery.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from './common/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule, // Global logger module
    CloudinaryModule, // Global Cloudinary module for image/video uploads
    // Rate limiting: 10 requests per minute per IP by default
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 10, // 10 requests per ttl
    }]),
    ContactModule,
    BookingModule,
    GalleryModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    // Apply throttler guard globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
