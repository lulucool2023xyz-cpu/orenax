import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VertexAiModule } from '../vertex-ai/vertex-ai.module';
import { GeminiApiController } from './gemini-api.controller';
import { UserController } from './controllers/user.controller';
import { ContextController } from './controllers/context.controller';
import { GeminiApiConfigService } from './config/gemini-api.config';
import { GeminiGenerationService } from './services/gemini-generation.service';
import { GeminiStreamingService } from './services/gemini-streaming.service';
import { GeminiConversationService } from './services/gemini-conversation.service';
import { GeminiImageService } from './services/gemini-image.service';
import { GeminiVideoService } from './services/gemini-video.service';
import { GeminiMusicService } from './services/gemini-music.service';
import { TtsService } from './services/tts.service';
import { ContextPromptService } from './services/context-prompt.service';
import { LiveApiGateway } from './gateways/live-api.gateway';
import { LiveApiService } from './services/live-api.service';

/**
 * Gemini API Module
 * Provides Gemini AI functionality via API v2 endpoints
 * Includes: Chat, Image, Video (Veo), Music (Lyria), TTS, Context Memory, and Live API
 */
@Module({
    imports: [ConfigModule, VertexAiModule],
    controllers: [GeminiApiController, UserController, ContextController],
    providers: [
        GeminiApiConfigService,
        GeminiGenerationService,
        GeminiStreamingService,
        GeminiConversationService,
        GeminiImageService,
        GeminiVideoService,
        GeminiMusicService,
        TtsService,
        ContextPromptService,
        LiveApiGateway,
        LiveApiService,
    ],
    exports: [
        GeminiApiConfigService,
        GeminiGenerationService,
        GeminiStreamingService,
        GeminiConversationService,
        GeminiImageService,
        GeminiVideoService,
        GeminiMusicService,
        TtsService,
        TtsService,
        ContextPromptService,
        LiveApiService,
    ],
})
export class GeminiApiModule { }



