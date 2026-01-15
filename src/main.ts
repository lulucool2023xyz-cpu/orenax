import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { json, urlencoded } from 'express';
import compression from 'compression';
import { AppModule } from './app.module';
import { bootstrapProduction } from './bootstrap';
import { AiExceptionFilter } from './ai-core/filters/ai-exception.filter';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Run production bootstrap (handles Google credentials, etc.)
  bootstrapProduction();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: process.env.NODE_ENV === 'production'
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Enable Gzip compression for responses
  app.use(compression());

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
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g., curl, server-to-server) with no origin
      if (!origin) return callback(null, true);

      // Allow explicit allowed origins or any subdomain of up.railway.app
      const isAllowed = allowedOrigins.includes(origin) || /\.up\.railway\.app$/.test(origin);
      if (isAllowed) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Enable WsAdapter for native WebSocket support (required for Live API)
  app.useWebSocketAdapter(new WsAdapter(app));

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

  // Apply global timeout interceptor (30s default, 120s for AI generation)
  app.useGlobalInterceptors(new TimeoutInterceptor());

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('OrenaX Backend API')
    .setDescription('AI-powered backend with Gemini, Vertex AI, Image/Video/Music generation')
    .setVersion('2.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Use PORT from environment (Railway provides this)
  const port = process.env.PORT || 3001;

  await app.listen(port, '0.0.0.0'); // Bind to 0.0.0.0 for Railway

  logger.log(`🚀 OrenaX Backend is running on port ${port}`);
  logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`📚 Swagger Docs: http://localhost:${port}/api/docs`);
  logger.log(`🔗 Health check: http://localhost:${port}/health/live`);
}

bootstrap();
