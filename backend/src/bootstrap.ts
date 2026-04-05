import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import { join } from 'path';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger.service';

function getAllowedOrigins(): string[] {
  return process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000'];
}

function configureMiddleware(
  app: INestApplication,
  logger: LoggerService,
  allowedOrigins: string[],
): void {
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

  if (
    process.env.NODE_ENV === 'production' &&
    process.env.ENFORCE_HTTPS === 'true'
  ) {
    app.use(
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        if (req.headers['x-forwarded-proto'] !== 'https') {
          logger.warn(`HTTPS redirect: ${req.method} ${req.url}`);
          return res.redirect(301, `https://${req.headers.host}${req.url}`);
        }
        next();
      },
    );
  }

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

  const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () =>
      process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
    cookieName: '_csrf',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getSessionIdentifier: (req) => req.cookies?.sessionId || 'anonymous',
  });

  if (process.env.ENABLE_CSRF === 'true') {
    app.use(doubleCsrfProtection);
    logger.log('CSRF Protection enabled');
  } else {
    logger.warn(
      'CSRF Protection is DISABLED - enable in production with ENABLE_CSRF=true',
    );
  }

  app.use(
    (
      req: express.Request,
      _res: express.Response,
      next: express.NextFunction,
    ) => {
      req.app.locals.generateCsrfToken = generateCsrfToken;
      next();
    },
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*')
      ) {
        return callback(null, true);
      }

      logger.warn(`CORS blocked origin: ${origin}`);
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
  });

  const logger = app.get(LoggerService);
  const allowedOrigins = getAllowedOrigins();

  app.useLogger(logger);
  configureMiddleware(app, logger, allowedOrigins);
  logger.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);

  return app;
}
