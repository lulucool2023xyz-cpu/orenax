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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    VertexAiModule,
    AuthModule,
    GeminiModule,
    GeminiApiModule,  // New Gemini API v2 module
    ChatModule,
    ImageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
