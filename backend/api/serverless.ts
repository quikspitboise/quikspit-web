import type { VercelRequest, VercelResponse } from '@vercel/node';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { LoggerService } from '../src/common/logger.service';

let app: express.Express | null = null;

async function createApp() {
  const nestApp = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = nestApp.get(LoggerService);
  nestApp.useLogger(logger);
  nestApp.setGlobalPrefix('api');

  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  nestApp.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    }),
  );

  nestApp.use(cookieParser());

  const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
    cookieName: '_csrf',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getSessionIdentifier: (req) => req.cookies?.sessionId || 'anonymous',
  });

  if (process.env.ENABLE_CSRF === 'true') {
    nestApp.use(doubleCsrfProtection);
  }

  nestApp.use(
    (req: express.Request, _res: express.Response, next: express.NextFunction) => {
      req.app.locals.generateCsrfToken = generateCsrfToken;
      next();
    },
  );

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'];

  nestApp.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await nestApp.init();
  return nestApp.getHttpAdapter().getInstance() as express.Express;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!app) {
    app = await createApp();
  }
  return app(req, res);
}
