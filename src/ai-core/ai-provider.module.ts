import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiConfigService } from './config/ai-config.service';
import { AiStrategyFactory } from './services/ai-strategy.factory';
import { AiDtoMapperService } from './services/ai-dto-mapper.service';
import { AiGenerationService } from './services/ai-generation.service';
import { AiWarmupService } from './services/ai-warmup.service';

/**
 * AI Provider Module
 * Centralized core for all AI capabilities (Gemini, Vertex AI, Multimodal)
 * Replaces redundant modules while maintaining backward compatibility
 */
@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        AiConfigService,
        AiStrategyFactory,
        AiDtoMapperService,
        AiGenerationService,
        AiWarmupService,  // Initializes AI clients on bootstrap
    ],
    exports: [
        AiConfigService,
        AiStrategyFactory,
        AiDtoMapperService,
        AiGenerationService,
    ],
})
export class AiProviderModule { }
