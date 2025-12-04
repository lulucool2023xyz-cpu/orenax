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

/**
 * Vertex AI Module
 * Provides all Vertex AI related services (All Phases)
 */
@Global()
@Module({
    imports: [ConfigModule, SupabaseModule],
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
    ],
})
export class VertexAiModule { }
