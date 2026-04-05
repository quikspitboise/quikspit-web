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
import { HealthController } from './health.controller';
import { getDatabaseConnectionOptions } from './database.config';
import { CreateGalleryItemsTable1740000000000 } from './migrations/1740000000000-CreateGalleryItemsTable';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...getDatabaseConnectionOptions(),
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
      migrationsRun: process.env.NODE_ENV === 'production',
      migrations: [CreateGalleryItemsTable1740000000000],
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
