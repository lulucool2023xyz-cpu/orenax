import { Injectable } from '@nestjs/common';
import { AiConfigService } from '../config/ai-config.service';
import { AiModelId } from '../constants/ai-models';

export type AiProviderType = 'gemini' | 'vertex';

@Injectable()
export class AiStrategyFactory {
    constructor(private readonly config: AiConfigService) { }

    /**
     * Determine which provider to use for a given model
     * Preference:
     * 1. If GEMINI_API_KEY is present, use Gemini SDK (simpler)
     * 2. If vertex config is present, use Vertex AI
     * 3. Fallback to Gemini if possible
     */
    getProviderForModel(modelId: string): AiProviderType {
        // Some models might only exist in Vertex or Gemini, but for now we unify
        if (this.config.isProviderEnabled('gemini')) {
            return 'gemini';
        }

        if (this.config.isProviderEnabled('vertex')) {
            return 'vertex';
        }

        throw new Error('No AI Providers are currently configured. Please check your .env file.');
    }

    /**
     * Check if a model is available in the current configuration
     */
    isModelSupported(modelId: string): boolean {
        const info = this.config.getModelInfo(modelId as AiModelId);
        return !!info;
    }
}
