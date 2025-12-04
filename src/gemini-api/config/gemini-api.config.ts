import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    DEFAULT_MODEL,
    DEFAULT_GENERATION_CONFIG,
    DEFAULT_SAFETY_SETTINGS,
    DEFAULT_SYSTEM_INSTRUCTION,
    GeminiModelId,
    GEMINI_MODELS,
} from '../types';

/**
 * Gemini API Configuration Service
 * Manages configuration and client initialization for Gemini API
 */
@Injectable()
export class GeminiApiConfigService {
    private readonly apiKey: string;
    private readonly genAI: GoogleGenerativeAI;
    private readonly defaultModel: GeminiModelId;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';

        if (!this.apiKey) {
            console.warn('GEMINI_API_KEY not found in environment variables');
        }

        // Initialize the GoogleGenerativeAI client
        this.genAI = new GoogleGenerativeAI(this.apiKey);

        // Get default model from config or use constant
        this.defaultModel =
            (this.configService.get<string>('GEMINI_DEFAULT_MODEL') as GeminiModelId) ||
            DEFAULT_MODEL;
    }

    /**
     * Get the GoogleGenerativeAI client instance
     */
    getClient(): GoogleGenerativeAI {
        return this.genAI;
    }

    /**
     * Get API Key
     */
    getApiKey(): string {
        return this.apiKey;
    }

    /**
     * Check if API key is configured
     */
    isConfigured(): boolean {
        return !!this.apiKey && this.apiKey.length > 0;
    }

    /**
     * Get default model
     */
    getDefaultModel(): GeminiModelId {
        return this.defaultModel;
    }

    /**
     * Get model info
     */
    getModelInfo(modelId: GeminiModelId) {
        return GEMINI_MODELS[modelId];
    }

    /**
     * Get all supported models
     */
    getSupportedModels() {
        return Object.values(GEMINI_MODELS);
    }

    /**
     * Check if model is valid
     */
    isValidModel(modelId: string): modelId is GeminiModelId {
        return modelId in GEMINI_MODELS;
    }

    /**
     * Get default generation config
     */
    getDefaultGenerationConfig() {
        return { ...DEFAULT_GENERATION_CONFIG };
    }

    /**
     * Get default safety settings
     */
    getDefaultSafetySettings() {
        return [...DEFAULT_SAFETY_SETTINGS];
    }

    /**
     * Get default system instruction
     */
    getDefaultSystemInstruction(): string {
        return (
            this.configService.get<string>('GEMINI_SYSTEM_INSTRUCTION') ||
            DEFAULT_SYSTEM_INSTRUCTION
        );
    }

    /**
     * Check if model supports thinking
     */
    supportsThinking(modelId: GeminiModelId): boolean {
        const model = GEMINI_MODELS[modelId];
        return model?.supportsThinking || false;
    }

    /**
     * Get thinking type for model
     */
    getThinkingType(modelId: GeminiModelId): 'level' | 'budget' | null {
        const model = GEMINI_MODELS[modelId];
        return model?.thinkingType || null;
    }
}
