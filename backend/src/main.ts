import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Set a global prefix so all routes become /api/... while keeping
  // controller decorators clean (e.g., @Controller('contact')).
  app.setGlobalPrefix('api');
  
  // Enable CORS for frontend communication
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Serve static assets for gallery/resources
  // Example: files under backend/resources/** will be available at /resources/**
  app.use('/resources', express.static(join(process.cwd(), 'resources')));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend server is running on http://localhost:${port}`);
}
bootstrap();
