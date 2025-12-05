import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GeminiModule } from './gemini/gemini.module';
import { GeminiApiModule } from './gemini-api/gemini-api.module';
import { SupabaseModule } from './supabase/supabase.module';
import { VertexAiModule } from './vertex-ai/vertex-ai.module';
import { ChatModule } from './chat/chat.module';
import { ImageModule } from './image/image.module';
import { VideoModule } from './video/video.module';
import { MusicModule } from './music/music.module';
import { AudioModule } from './audio/audio.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    VertexAiModule,
    AuthModule,
    GeminiModule,
    GeminiApiModule,  // Gemini API v2 module
    ChatModule,       // Chat API v1
    ImageModule,      // Image API v1
    VideoModule,      // Video API v1
    MusicModule,      // Music API v1 (Lyria)
    AudioModule,      // Audio/TTS API v1
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
