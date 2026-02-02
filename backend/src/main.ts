import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { join } from 'path';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import { LoggerService } from './common/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  // Set up custom logger
  const logger = app.get(LoggerService);
  app.useLogger(logger);
  
  // Set a global prefix so all routes become /api/... while keeping
  // controller decorators clean (e.g., @Controller('contact')).
  app.setGlobalPrefix('api');
  
  // Global validation pipe with transformation and whitelist
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable type conversion
      },
    }),
  );

  // HTTPS redirect middleware (for production behind reverse proxy)
  if (process.env.NODE_ENV === 'production' && process.env.ENFORCE_HTTPS === 'true') {
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        logger.warn(`HTTPS redirect: ${req.method} ${req.url}`);
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }
  
  // Security: Add HTTP security headers with helmet and Content Security Policy
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow resources to be loaded
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for development
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
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    }),
  );
  
  // Enable cookie parser for CSRF (must come before CSRF middleware)
  app.use(cookieParser());
  
  // CSRF Protection using csrf-csrf (modern replacement for deprecated csurf)
  const {
    generateCsrfToken, // Used to generate a CSRF token
    doubleCsrfProtection, // Middleware to validate CSRF tokens
  } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
    cookieName: '_csrf',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    },
    size: 64, // Token size
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getSessionIdentifier: (req) => {
      // Use session ID or a default identifier
      // In a real app, this should be from a session store
      return req.cookies?.sessionId || 'anonymous';
    },
  });
  
  // Apply CSRF protection conditionally (skip for development convenience)
  if (process.env.ENABLE_CSRF === 'true') {
    app.use(doubleCsrfProtection);
    logger.log('CSRF Protection enabled');
  } else {
    logger.warn('CSRF Protection is DISABLED - enable in production with ENABLE_CSRF=true');
  }
  
  // Store generateCsrfToken function in app locals for use in controllers
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    req.app.locals.generateCsrfToken = generateCsrfToken;
    next();
  });
  
  // Enable CORS for frontend communication (environment-based)
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000']; // Default for development
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Serve static assets for gallery/resources
  // Example: files under backend/resources/** will be available at /resources/**
  app.use('/resources', express.static(join(process.cwd(), 'resources')));

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`Backend server is running on port ${port}`);
  logger.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();
