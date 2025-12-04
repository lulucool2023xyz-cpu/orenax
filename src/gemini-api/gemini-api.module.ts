import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiApiController } from './gemini-api.controller';
import { GeminiApiConfigService } from './config/gemini-api.config';
import { GeminiGenerationService } from './services/gemini-generation.service';
import { GeminiStreamingService } from './services/gemini-streaming.service';

/**
 * Gemini API Module
 * Provides Gemini AI functionality via API v2 endpoints
 */
@Module({
    imports: [ConfigModule],
    controllers: [GeminiApiController],
    providers: [
        GeminiApiConfigService,
        GeminiGenerationService,
        GeminiStreamingService,
    ],
    exports: [
        GeminiApiConfigService,
        GeminiGenerationService,
        GeminiStreamingService,
    ],
})
export class GeminiApiModule { }
