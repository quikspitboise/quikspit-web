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
import {
  getDatabaseConnectionOptions,
  getSchemaSynchronization,
} from './database.config';
import { DATABASE_MIGRATIONS } from './database.registry';
import { RuntimeModule } from './runtime/runtime.module';
import { PostgresThrottlerStorage } from './runtime/postgres-throttler.storage';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...getDatabaseConnectionOptions(),
      autoLoadEntities: true,
      synchronize: getSchemaSynchronization(),
      logging: process.env.NODE_ENV === 'development',
      // Migrations must only run at deploy time via `pnpm --filter backend
      // migration:run`; running them on every Vercel cold start risks DB lock
      // contention and function timeouts.
      migrationsRun: false,
      // Nest defaults (10 attempts x 3s delay) can stall a cold start past the
      // serverless maxDuration; fail fast and let the next invocation retry.
      retryAttempts: 2,
      retryDelay: 500,
      migrations: DATABASE_MIGRATIONS,
    }),
    LoggerModule,
    AuthModule,
    CloudinaryModule,
    RuntimeModule,
    ThrottlerModule.forRootAsync({
      imports: [RuntimeModule],
      inject: [PostgresThrottlerStorage],
      useFactory: (storage: PostgresThrottlerStorage) => ({
        throttlers: [{ ttl: 60000, limit: 60 }],
        storage,
      }),
    }),
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
