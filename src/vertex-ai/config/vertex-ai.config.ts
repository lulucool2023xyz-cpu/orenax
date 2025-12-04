import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GEMINI_MODELS, GeminiModelId, API_CONFIG } from '../types/constants';

/**
 * Configuration service for Vertex AI
 * Handles environment variables and provides validated configuration
 */
@Injectable()
export class VertexAiConfigService {
    private readonly logger = new Logger(VertexAiConfigService.name);

    constructor(private configService: ConfigService) {
        this.validateConfiguration();
    }

    /**
     * Get Google Cloud Project ID
     */
    getProjectId(): string {
        const projectId = this.configService.get<string>('GOOGLE_CLOUD_PROJECT');
        if (!projectId) {
            throw new Error('GOOGLE_CLOUD_PROJECT environment variable is not set');
        }
        return projectId;
    }

    /**
     * Get Google Cloud Location
     */
    getLocation(): string {
        return this.configService.get<string>(
            'GOOGLE_CLOUD_LOCATION',
            API_CONFIG.DEFAULT_LOCATION,
        );
    }

    /**
     * Get path to service account credentials
     */
    getCredentialsPath(): string {
        const path = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
        if (!path) {
            throw new Error(
                'GOOGLE_APPLICATION_CREDENTIALS environment variable is not set',
            );
        }
        return path;
    }

    /**
     * Get default model ID
     */
    getDefaultModel(): GeminiModelId {
        const model = this.configService.get<string>(
            'VERTEX_AI_DEFAULT_MODEL',
            'gemini-2.5-pro',
        );

        if (!this.isValidModel(model)) {
            this.logger.warn(`Invalid default model: ${model}, falling back to gemini-2.5-pro`);
            return 'gemini-2.5-pro';
        }

        return model as GeminiModelId;
    }

    /**
     * Get API endpoint
     */
    getApiEndpoint(): string {
        return this.configService.get<string>(
            'VERTEX_AI_API_ENDPOINT',
            API_CONFIG.DEFAULT_ENDPOINT,
        );
    }

    /**
     * Get full model path for a given model ID
     */
    getModelPath(modelId: GeminiModelId): string {
        const template = GEMINI_MODELS[modelId];
        return template
            .replace('{project}', this.getProjectId())
            .replace('{location}', this.getLocation());
    }

    /**
     * Check if a model ID is valid
     */
    isValidModel(modelId: string): boolean {
        return modelId in GEMINI_MODELS;
    }

    /**
     * Get list of supported models
     */
    getSupportedModels(): GeminiModelId[] {
        return Object.keys(GEMINI_MODELS) as GeminiModelId[];
    }

    /**
     * Check if model supports thinking budget (Gemini 2.5)
     */
    supportsThinkingBudget(modelId: GeminiModelId): boolean {
        return modelId.includes('gemini-2.5');
    }

    /**
     * @deprecated Legacy method - Gemini 3 does not exist
     */
    supportsThinkingLevel(modelId: GeminiModelId): boolean {
        return false;
    }

    /**
     * Check if model has thinking capabilities
     */
    isThinkingModel(modelId: GeminiModelId): boolean {
        return this.supportsThinkingBudget(modelId);
    }

    /**
     * Validate all required configuration on startup
     */
    private validateConfiguration(): void {
        try {
            this.getProjectId();
            this.getCredentialsPath();
            this.logger.log('Vertex AI configuration validated successfully');
        } catch (error) {
            this.logger.error('Vertex AI configuration validation failed:', error.message);
            throw error;
        }
    }
}
