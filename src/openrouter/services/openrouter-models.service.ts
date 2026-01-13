/**
 * OpenRouter Models Service
 * Manage and query available AI models
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    OpenRouterModel,
    OpenRouterModelsResponse,
    PREMIUM_MODELS,
    MODEL_CAPABILITIES,
    ModelCapabilities,
} from '../types/openrouter.types';
import { ModelInfoDto, ModelsListResponseDto } from '../dto/model-list.dto';

interface PremiumModelInfo {
    id: string;
    name: string;
    description: string;
    provider: string;
    tier: 'flagship' | 'balanced' | 'fast';
    capabilities: ModelCapabilities;
    pricing: {
        prompt: number;
        completion: number;
    };
}

@Injectable()
export class OpenRouterModelsService {
    private readonly logger = new Logger(OpenRouterModelsService.name);
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private modelsCache: OpenRouterModel[] = [];
    private cacheTimestamp: number = 0;
    private readonly cacheTTL = 3600000; // 1 hour

    // Premium models with detailed info
    private readonly premiumModelsInfo: PremiumModelInfo[] = [
        {
            id: PREMIUM_MODELS.CLAUDE_OPUS_4_5,
            name: 'Claude Opus 4.5',
            description: 'Most intelligent Claude model with exceptional reasoning',
            provider: 'Anthropic',
            tier: 'flagship',
            capabilities: MODEL_CAPABILITIES[PREMIUM_MODELS.CLAUDE_OPUS_4_5],
            pricing: { prompt: 15, completion: 75 },
        },
        {
            id: PREMIUM_MODELS.CLAUDE_SONNET_4_5,
            name: 'Claude Sonnet 4.5',
            description: 'Balanced performance with excellent quality',
            provider: 'Anthropic',
            tier: 'balanced',
            capabilities: MODEL_CAPABILITIES[PREMIUM_MODELS.CLAUDE_SONNET_4_5],
            pricing: { prompt: 3, completion: 15 },
        },
        {
            id: PREMIUM_MODELS.GPT_5_2,
            name: 'GPT-5.2',
            description: 'Latest OpenAI flagship with advanced reasoning',
            provider: 'OpenAI',
            tier: 'flagship',
            capabilities: MODEL_CAPABILITIES[PREMIUM_MODELS.GPT_5_2],
            pricing: { prompt: 10, completion: 30 },
        },
        {
            id: PREMIUM_MODELS.GPT_4O,
            name: 'GPT-4o',
            description: 'Multimodal model with vision and audio capabilities',
            provider: 'OpenAI',
            tier: 'balanced',
            capabilities: MODEL_CAPABILITIES[PREMIUM_MODELS.GPT_4O],
            pricing: { prompt: 5, completion: 15 },
        },
        {
            id: PREMIUM_MODELS.GPT_4O_AUDIO,
            name: 'GPT-4o Audio',
            description: 'Specialized for audio processing and understanding',
            provider: 'OpenAI',
            tier: 'balanced',
            capabilities: {
                supportsVision: true,
                supportsAudio: true,
                supportsFunctionCalling: true,
                supportsStreaming: true,
                supportsSystemPrompt: true,
                maxContextTokens: 128000,
                maxOutputTokens: 16384,
            },
            pricing: { prompt: 10, completion: 20 },
        },
        {
            id: PREMIUM_MODELS.GEMINI_2_5_PRO,
            name: 'Gemini 2.5 Pro',
            description: 'Google flagship with 1M context window',
            provider: 'Google',
            tier: 'balanced',
            capabilities: MODEL_CAPABILITIES[PREMIUM_MODELS.GEMINI_2_5_PRO],
            pricing: { prompt: 2.5, completion: 10 },
        },
        {
            id: PREMIUM_MODELS.GEMINI_2_5_FLASH,
            name: 'Gemini 2.5 Flash',
            description: 'Fast and efficient for quick tasks',
            provider: 'Google',
            tier: 'fast',
            capabilities: {
                supportsVision: true,
                supportsAudio: true,
                supportsFunctionCalling: true,
                supportsStreaming: true,
                supportsSystemPrompt: true,
                maxContextTokens: 1048576,
                maxOutputTokens: 8192,
            },
            pricing: { prompt: 0.075, completion: 0.3 },
        },
        {
            id: PREMIUM_MODELS.O1,
            name: 'o1',
            description: 'Advanced reasoning model for complex problems',
            provider: 'OpenAI',
            tier: 'flagship',
            capabilities: {
                supportsVision: false,
                supportsAudio: false,
                supportsFunctionCalling: false,
                supportsStreaming: true,
                supportsSystemPrompt: false,
                maxContextTokens: 128000,
                maxOutputTokens: 32768,
            },
            pricing: { prompt: 15, completion: 60 },
        },
        {
            id: PREMIUM_MODELS.DEEPSEEK_R1,
            name: 'DeepSeek R1',
            description: 'Excellent for coding and technical tasks',
            provider: 'DeepSeek',
            tier: 'balanced',
            capabilities: {
                supportsVision: false,
                supportsAudio: false,
                supportsFunctionCalling: true,
                supportsStreaming: true,
                supportsSystemPrompt: true,
                maxContextTokens: 64000,
                maxOutputTokens: 8192,
            },
            pricing: { prompt: 0.55, completion: 2.19 },
        },
    ];

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY', '');
        this.baseUrl = this.configService.get<string>('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1');
    }

    /**
     * Get list of premium models (curated list)
     */
    getPremiumModels(filters?: {
        capability?: 'vision' | 'audio' | 'function_calling' | 'streaming';
        provider?: string;
        tier?: 'flagship' | 'balanced' | 'fast';
    }): ModelsListResponseDto {
        let models = this.premiumModelsInfo;

        if (filters?.capability) {
            models = models.filter(m => {
                switch (filters.capability) {
                    case 'vision': return m.capabilities?.supportsVision;
                    case 'audio': return m.capabilities?.supportsAudio;
                    case 'function_calling': return m.capabilities?.supportsFunctionCalling;
                    case 'streaming': return m.capabilities?.supportsStreaming;
                    default: return true;
                }
            });
        }

        if (filters?.provider) {
            const providerFilter = filters.provider.toLowerCase();
            models = models.filter(m =>
                m.provider.toLowerCase() === providerFilter,
            );
        }

        if (filters?.tier) {
            models = models.filter(m => m.tier === filters.tier);
        }

        const modelInfoList: ModelInfoDto[] = models.map(m => ({
            id: m.id,
            name: m.name,
            description: m.description,
            provider: m.provider,
            context_length: m.capabilities?.maxContextTokens || 128000,
            pricing: m.pricing,
            capabilities: {
                supportsVision: m.capabilities?.supportsVision || false,
                supportsAudio: m.capabilities?.supportsAudio || false,
                supportsFunctionCalling: m.capabilities?.supportsFunctionCalling || false,
                supportsStreaming: m.capabilities?.supportsStreaming || true,
                maxContextTokens: m.capabilities?.maxContextTokens || 128000,
                maxOutputTokens: m.capabilities?.maxOutputTokens || 4096,
            },
            tier: m.tier,
        }));

        return {
            models: modelInfoList,
            total: modelInfoList.length,
            premium_only: true,
        };
    }

    /**
     * Fetch all models from OpenRouter API
     */
    async fetchAllModels(forceRefresh: boolean = false): Promise<OpenRouterModel[]> {
        const now = Date.now();

        // Return cached if valid
        if (!forceRefresh && this.modelsCache.length > 0 && now - this.cacheTimestamp < this.cacheTTL) {
            return this.modelsCache;
        }

        try {
            const response = await fetch(`${this.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch models: ${response.status}`);
            }

            const data = await response.json() as OpenRouterModelsResponse;
            this.modelsCache = data.data;
            this.cacheTimestamp = now;

            this.logger.log(`Fetched ${data.data.length} models from OpenRouter`);
            return this.modelsCache;
        } catch (error) {
            this.logger.error(`Failed to fetch models: ${error.message}`);
            // Return cached even if stale
            return this.modelsCache;
        }
    }

    /**
     * Get specific model by ID
     */
    async getModel(modelId: string): Promise<ModelInfoDto | null> {
        // Check premium models first
        const premium = this.premiumModelsInfo.find(m => m.id === modelId);
        if (premium) {
            return {
                id: premium.id,
                name: premium.name,
                description: premium.description,
                provider: premium.provider,
                context_length: premium.capabilities?.maxContextTokens || 128000,
                pricing: premium.pricing,
                capabilities: {
                    supportsVision: premium.capabilities?.supportsVision || false,
                    supportsAudio: premium.capabilities?.supportsAudio || false,
                    supportsFunctionCalling: premium.capabilities?.supportsFunctionCalling || false,
                    supportsStreaming: premium.capabilities?.supportsStreaming || true,
                    maxContextTokens: premium.capabilities?.maxContextTokens || 128000,
                    maxOutputTokens: premium.capabilities?.maxOutputTokens || 4096,
                },
                tier: premium.tier,
            };
        }

        // Fetch from API if not in premium list
        const allModels = await this.fetchAllModels();
        const model = allModels.find(m => m.id === modelId);

        if (!model) {
            return null;
        }

        const provider = modelId.split('/')[0];

        return {
            id: model.id,
            name: model.name || modelId,
            description: model.description,
            provider: provider.charAt(0).toUpperCase() + provider.slice(1),
            context_length: model.context_length,
            pricing: {
                prompt: model.pricing.prompt * 1000000, // Convert to per 1M
                completion: model.pricing.completion * 1000000,
            },
            capabilities: {
                supportsVision: false, // Unknown from API
                supportsAudio: false,
                supportsFunctionCalling: false,
                supportsStreaming: true,
                maxContextTokens: model.context_length,
                maxOutputTokens: model.top_provider?.max_completion_tokens || 4096,
            },
            tier: 'balanced',
        };
    }

    /**
     * Get model recommendations based on use case
     */
    getRecommendedModels(useCase: 'chat' | 'vision' | 'audio' | 'coding' | 'reasoning'): string[] {
        switch (useCase) {
            case 'chat':
                return [
                    PREMIUM_MODELS.CLAUDE_SONNET_4_5,
                    PREMIUM_MODELS.GPT_4O,
                    PREMIUM_MODELS.GEMINI_2_5_PRO,
                ];
            case 'vision':
                return [
                    PREMIUM_MODELS.CLAUDE_OPUS_4_5,
                    PREMIUM_MODELS.GPT_4O,
                    PREMIUM_MODELS.GEMINI_2_5_PRO,
                ];
            case 'audio':
                return [
                    PREMIUM_MODELS.GPT_4O_AUDIO,
                    PREMIUM_MODELS.GEMINI_2_5_PRO,
                ];
            case 'coding':
                return [
                    PREMIUM_MODELS.CLAUDE_SONNET_4_5,
                    PREMIUM_MODELS.DEEPSEEK_R1,
                    PREMIUM_MODELS.GPT_4O,
                ];
            case 'reasoning':
                return [
                    PREMIUM_MODELS.CLAUDE_OPUS_4_5,
                    PREMIUM_MODELS.O1,
                    PREMIUM_MODELS.GPT_5_2,
                ];
            default:
                return [PREMIUM_MODELS.CLAUDE_SONNET_4_5];
        }
    }
}
