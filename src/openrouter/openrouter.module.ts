/**
 * OpenRouter Module
 * Premium AI models via OpenRouter unified API
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Controller
import { OpenRouterController } from './openrouter.controller';

// Services
import { OpenRouterChatService } from './services/openrouter-chat.service';
import { OpenRouterStreamingService } from './services/openrouter-streaming.service';
import { OpenRouterModelsService } from './services/openrouter-models.service';
import { OpenRouterVisionService } from './services/openrouter-vision.service';
import { OpenRouterAudioService } from './services/openrouter-audio.service';
import { OpenRouterFunctionCallingService } from './services/openrouter-function-calling.service';

// Config
import openrouterConfig from './config/openrouter.config';

@Module({
    imports: [
        ConfigModule.forFeature(openrouterConfig),
    ],
    controllers: [OpenRouterController],
    providers: [
        OpenRouterChatService,
        OpenRouterStreamingService,
        OpenRouterModelsService,
        OpenRouterVisionService,
        OpenRouterAudioService,
        OpenRouterFunctionCallingService,
    ],
    exports: [
        OpenRouterChatService,
        OpenRouterStreamingService,
        OpenRouterModelsService,
        OpenRouterVisionService,
        OpenRouterAudioService,
        OpenRouterFunctionCallingService,
    ],
})
export class OpenRouterModule { }
