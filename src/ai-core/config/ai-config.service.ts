import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_MODELS, AiModelId, DEFAULT_AI_MODEL, AI_CONFIG_DEFAULTS } from '../constants/ai-models';

@Injectable()
export class AiConfigService {
    private readonly logger = new Logger(AiConfigService.name);
    private readonly geminiApiKey: string;
    private readonly projectId: string;
    private readonly location: string;
    private readonly credentialsPath: string;
    private readonly geminiClient: GoogleGenerativeAI;

    constructor(private readonly configService: ConfigService) {
        this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
        this.projectId = this.configService.get<string>('GOOGLE_CLOUD_PROJECT') || '';
        this.location = this.configService.get<string>('GOOGLE_CLOUD_LOCATION') || AI_CONFIG_DEFAULTS.LOCATION;
        this.credentialsPath = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS') || '';

        // Initialize Gemini API client if key exists
        if (this.geminiApiKey) {
            this.geminiClient = new GoogleGenerativeAI(this.geminiApiKey);
        }

        this.validateConfig();
    }

    private validateConfig() {
        if (!this.geminiApiKey && !this.projectId) {
            this.logger.warn('Neither GEMINI_API_KEY nor GOOGLE_CLOUD_PROJECT found. AI features may not work.');
        }
    }

    /**
     * Get Gemini SDK client
     */
    getGeminiClient(): GoogleGenerativeAI {
        if (!this.geminiClient) {
            throw new Error('Gemini API is not configured (GEMINI_API_KEY missing)');
        }
        return this.geminiClient;
    }

    /**
     * Get Vertex AI / GCR settings
     */
    getVertexConfig() {
        return {
            projectId: this.projectId,
            location: this.location,
            credentialsPath: this.credentialsPath,
        };
    }

    /**
     * Check if specific provider is enabled
     */
    isProviderEnabled(provider: 'gemini' | 'vertex'): boolean {
        return provider === 'gemini' ? !!this.geminiApiKey : !!this.projectId;
    }

    /**
     * Get model details
     */
    getModelInfo(modelId: AiModelId) {
        return AI_MODELS[modelId];
    }

    /**
     * Get default model ID
     */
    getDefaultModel(): AiModelId {
        return (this.configService.get<string>('DEFAULT_AI_MODEL') as AiModelId) || DEFAULT_AI_MODEL;
    }

    /**
     * Resolve model path for Vertex AI
     */
    resolveVertexModelPath(modelId: AiModelId): string {
        const model = AI_MODELS[modelId];
        if (!model) throw new Error(`Invalid model ID: ${modelId}`);

        return model.vertexResource
            .replace('{project}', this.projectId)
            .replace('{location}', this.location);
    }
}
