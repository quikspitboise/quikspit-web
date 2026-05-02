import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { LoggerModule } from './common/logger.module';
import { ContactModule } from './contact/contact.module';
import { GalleryModule } from './gallery/gallery.module';
import { InvoiceModule } from './invoice/invoice.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SettingsModule } from './settings/settings.module';
import { HealthController } from './health.controller';
import { getDatabaseConnectionOptions } from './database.config';
import { CreateGalleryItemsTable1740000000000 } from './migrations/1740000000000-CreateGalleryItemsTable';
import { CreateAppSettingsTable1740000001000 } from './migrations/1740000001000-CreateAppSettingsTable';
import { AddGalleryCloudinaryMetadata1740000002000 } from './migrations/1740000002000-AddGalleryCloudinaryMetadata';

const isProductionRuntime =
  process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...getDatabaseConnectionOptions(),
      autoLoadEntities: true,
      synchronize: !isProductionRuntime,
      logging: process.env.NODE_ENV === 'development',
      migrationsRun: isProductionRuntime,
      migrations: [
        CreateGalleryItemsTable1740000000000,
        CreateAppSettingsTable1740000001000,
        AddGalleryCloudinaryMetadata1740000002000,
      ],
    }),
    LoggerModule,
    AuthModule,
    CloudinaryModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ContactModule,
    BookingModule,
    GalleryModule,
    InvoiceModule,
    ReviewsModule,
    SettingsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
