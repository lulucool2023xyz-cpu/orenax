import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { bootstrapProduction } from './bootstrap';
import { AiExceptionFilter } from './ai-core/filters/ai-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Run production bootstrap (handles Google credentials, etc.)
  bootstrapProduction();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: process.env.NODE_ENV === 'production'
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Increase body parser limit for large image uploads (base64 encoded images can be large)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Serve static assets from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Enable CORS for frontend connection
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'https://orenax.vercel.app',
      'https://orenax.netlify.app',
      'https://artificial-production.up.railway.app',
      'https://orenax-production.up.railway.app',
      'http://localhost:59873',
    ];

  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? allowedOrigins
      : true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Apply global AI exception filter
  app.useGlobalFilters(new AiExceptionFilter());

  // Use PORT from environment (Railway provides this)
  const port = process.env.PORT || 3001;

  await app.listen(port, '0.0.0.0'); // Bind to 0.0.0.0 for Railway

  logger.log(`🚀 OrenaX Backend is running on port ${port}`);
  logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`🔗 Health check: http://localhost:${port}/api/v2/health`);
  logger.log(`🔗 API Portal: http://localhost:${port}`);
}

bootstrap();
