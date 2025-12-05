import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '../supabase/supabase.module';
import { VertexAiConfigService } from './config/vertex-ai.config';
import { GenerationService } from './services/generation.service';
import { StreamingService } from './services/streaming.service';
import { ConversationService } from './services/conversation.service';
import { ThinkingService } from './services/thinking.service';
import { MultimodalService } from './services/multimodal.service';
import { GroundingService } from './services/grounding.service';
import { FunctionCallingService } from './services/function-calling.service';
import { CacheService } from './services/cache.service';
import { ImageService } from './services/image.service';
import { GcsStorageService } from './services/gcs-storage.service';
import { GeminiImageService } from './services/gemini-image.service';
import { VideoService } from './services/video.service';
import { MusicService } from './services/music.service';
import { TtsService } from './services/tts.service';
import { GenAIClientService } from './services/genai-client.service';
import { PromptManagementService } from './services/prompt-management.service';
import { UrlContextService } from './services/url-context.service';
import { DocumentService } from './services/document.service';
import { SafetyFilterService } from './services/safety-filter.service';
import { V1ApiController } from './controllers/v1-api.controller';

/**
 * Vertex AI Module
 * Provides all Vertex AI related services (All Phases)
 */
@Global()
@Module({
    imports: [ConfigModule, SupabaseModule],
    controllers: [V1ApiController],
    providers: [
        VertexAiConfigService,
        GenerationService,
        StreamingService,
        ConversationService,
        ThinkingService,
        MultimodalService,
        GroundingService,
        FunctionCallingService,
        CacheService,
        GcsStorageService,
        ImageService,
        GeminiImageService,
        VideoService,
        MusicService,
        TtsService,
        GenAIClientService,
        PromptManagementService,
        UrlContextService,
        DocumentService,
        SafetyFilterService,
    ],
    exports: [
        VertexAiConfigService,
        GenerationService,
        StreamingService,
        ConversationService,
        ThinkingService,
        MultimodalService,
        GroundingService,
        FunctionCallingService,
        CacheService,
        GcsStorageService,
        ImageService,
        GeminiImageService,
        VideoService,
        MusicService,
        TtsService,
        GenAIClientService,
        PromptManagementService,
        UrlContextService,
        DocumentService,
        SafetyFilterService,
    ],
})
export class VertexAiModule { }
