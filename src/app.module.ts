import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GeminiModule } from './gemini/gemini.module';
import { GeminiApiModule } from './gemini-api/gemini-api.module';
import { SupabaseModule } from './supabase/supabase.module';
import { VertexAiModule } from './vertex-ai/vertex-ai.module';
import { AiProviderModule } from './ai-core';
import { ChatModule } from './chat/chat.module';
import { ImageModule } from './image/image.module';
import { VideoModule } from './video/video.module';
import { MusicModule } from './music/music.module';
import { AudioModule } from './audio/audio.module';
// Frontend Integration API v2 modules
import { PaymentModule } from './payment/payment.module';
import { MediaModule } from './media/media.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { ShareModule } from './share/share.module';
import { PromptsModule } from './prompts/prompts.module';
import { HealthModule } from './health/health.module';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    // Rate limiting: 60 requests per minute globally
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 1 minute
      limit: 60,   // 60 requests per minute
    }]),
    SupabaseModule,
    VertexAiModule,
    AiProviderModule,
    AuthModule,
    GeminiModule,
    GeminiApiModule,  // Gemini API v2 module
    ChatModule,       // Chat API v1
    ImageModule,      // Image API v1
    VideoModule,      // Video API v1
    MusicModule,      // Music API v1 (Lyria)
    AudioModule,      // Audio/TTS API v1
    // Frontend Integration API v2 modules
    PaymentModule,    // Payment & Subscription
    MediaModule,      // Media History/Gallery
    ApiKeysModule,    // User API Keys
    ShareModule,      // Chat Sharing
    PromptsModule,    // Prompt Marketplace
    HealthModule,     // Health Checks
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
