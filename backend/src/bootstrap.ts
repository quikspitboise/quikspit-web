import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import { join } from 'path';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger.service';
import { configureCsrfProtection } from './common/csrf-protection';
import { canonicalHttpsRedirect, configureProxyTrust } from './common/http-policy';

function getAllowedOrigins(): string[] {
  const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    throw new Error('ALLOWED_ORIGINS must be configured in production');
  }

  return ['http://localhost:3000'];
}

export function configureMiddleware(
  app: INestApplication,
  logger: LoggerService,
  allowedOrigins: string[],
): void {
  configureProxyTrust(app.getHttpAdapter().getInstance() as express.Express);
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const redirect = canonicalHttpsRedirect();
  if (redirect) app.use(redirect);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  app.use(cookieParser());

  configureCsrfProtection(app, logger, allowedOrigins);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn('CORS rejected an untrusted origin');
      callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use('/resources', express.static(join(process.cwd(), 'resources')));
}

export async function createNestApplication(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  const logger = app.get(LoggerService);
  const allowedOrigins = getAllowedOrigins();

  app.useLogger(logger);
  configureMiddleware(app, logger, allowedOrigins);
  logger.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);

  return app;
}
