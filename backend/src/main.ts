import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set a global prefix so all routes become /api/... while keeping
  // controller decorators clean (e.g., @Controller('contact')).
  app.setGlobalPrefix('api');
  
  // Security: Add HTTP security headers with helmet
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow resources to be loaded
  }));
  
  // Enable cookie parser for CSRF (must come before CSRF middleware)
  app.use(cookieParser());
  
  // CSRF Protection for POST/PUT/PATCH/DELETE requests
  // Note: GET requests and requests with valid CSRF tokens will pass through
  const csrfProtection = csurf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict',
    },
  });
  
  // Apply CSRF protection conditionally (skip for development convenience)
  if (process.env.ENABLE_CSRF === 'true') {
    app.use(csrfProtection);
    console.log('✓ CSRF Protection enabled');
  } else {
    console.warn('⚠ CSRF Protection is DISABLED - enable in production with ENABLE_CSRF=true');
  }
  
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
        console.warn(`CORS blocked origin: ${origin}`);
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
  console.log(`🚀 Backend server is running on port ${port}`);
  console.log(`📋 Allowed CORS origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();
