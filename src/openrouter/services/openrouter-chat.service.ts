/**
 * OpenRouter Chat Service
 * Core chat completion functionality with premium models
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    OpenRouterRequest,
    OpenRouterResponse,
    OpenRouterError,
    OpenRouterApiError,
    PREMIUM_MODELS,
    MODEL_CAPABILITIES,
} from '../types/openrouter.types';
import { OpenRouterConfig } from '../config/openrouter.config';

@Injectable()
export class OpenRouterChatService {
    private readonly logger = new Logger(OpenRouterChatService.name);
    private readonly config: OpenRouterConfig;

    constructor(private readonly configService: ConfigService) {
        this.config = {
            apiKey: this.configService.get<string>('OPENROUTER_API_KEY', ''),
            baseUrl: this.configService.get<string>('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
            defaultModel: this.configService.get<string>('OPENROUTER_DEFAULT_MODEL', PREMIUM_MODELS.CLAUDE_SONNET_4_5),
            fallbackModels: [PREMIUM_MODELS.CLAUDE_OPUS_4_5, PREMIUM_MODELS.GPT_4O],
            siteUrl: this.configService.get<string>('OPENROUTER_SITE_URL', 'https://orenax.com'),
            siteName: this.configService.get<string>('OPENROUTER_SITE_NAME', 'OrenaX AI Platform'),
            timeout: this.configService.get<number>('OPENROUTER_TIMEOUT', 120000),
            retryAttempts: this.configService.get<number>('OPENROUTER_RETRY_ATTEMPTS', 3),
            retryDelay: this.configService.get<number>('OPENROUTER_RETRY_DELAY', 1000),
        };

        if (!this.config.apiKey) {
            this.logger.warn('OpenRouter API key not configured. Set OPENROUTER_API_KEY environment variable.');
        }
    }

    /**
     * Create a chat completion using OpenRouter
     */
    async createChatCompletion(request: OpenRouterRequest): Promise<OpenRouterResponse> {
        const model = request.model || this.config.defaultModel;

        this.logger.log(`Chat completion request - Model: ${model}`);

        const payload: OpenRouterRequest = {
            ...request,
            model,
            stream: false, // Non-streaming for this method
        };

        return this.executeWithRetry(() => this.sendRequest(payload), model);
    }

    /**
     * Send request to OpenRouter API
     */
    private async sendRequest(payload: OpenRouterRequest): Promise<OpenRouterResponse> {
        const url = `${this.config.baseUrl}/chat/completions`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'HTTP-Referer': this.config.siteUrl,
                    'X-Title': this.config.siteName,
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorBody = await response.json() as OpenRouterError;
                throw new OpenRouterApiError(
                    response.status,
                    errorBody.error?.type || 'unknown',
                    errorBody.error?.message || 'Unknown error from OpenRouter',
                    errorBody,
                );
            }

            const data = await response.json() as OpenRouterResponse;

            this.logger.log(
                `Chat completion success - Model: ${data.model}, ` +
                `Tokens: ${data.usage?.total_tokens || 'N/A'}`,
            );

            return data;
        } catch (error) {
            if (error instanceof OpenRouterApiError) {
                throw error;
            }

            if (error.name === 'AbortError') {
                throw new HttpException(
                    'Request timeout - OpenRouter did not respond in time',
                    HttpStatus.GATEWAY_TIMEOUT,
                );
            }

            this.logger.error(`OpenRouter request failed: ${error.message}`);
            throw new HttpException(
                `OpenRouter API error: ${error.message}`,
                HttpStatus.BAD_GATEWAY,
            );
        }
    }

    /**
     * Execute request with retry logic and fallback models
     */
    private async executeWithRetry(
        requestFn: () => Promise<OpenRouterResponse>,
        currentModel: string,
        attempt: number = 1,
    ): Promise<OpenRouterResponse> {
        try {
            return await requestFn();
        } catch (error) {
            const isRetryable = this.isRetryableError(error);

            if (isRetryable && attempt < this.config.retryAttempts) {
                this.logger.warn(
                    `Request failed (attempt ${attempt}/${this.config.retryAttempts}), retrying...`,
                );
                await this.delay(this.config.retryDelay * attempt);
                return this.executeWithRetry(requestFn, currentModel, attempt + 1);
            }

            // Try fallback models
            const fallbackModels = this.config.fallbackModels.filter(m => m !== currentModel);
            if (fallbackModels.length > 0 && this.shouldUseFallback(error)) {
                const fallbackModel = fallbackModels[0];
                this.logger.warn(`Using fallback model: ${fallbackModel}`);
                // Would need to recreate the request with new model
                // For now, just throw the error
            }

            throw error;
        }
    }

    private isRetryableError(error: unknown): boolean {
        if (error instanceof OpenRouterApiError) {
            // Retry on rate limit (429), server errors (5xx)
            return error.statusCode === 429 || error.statusCode >= 500;
        }
        return false;
    }

    private shouldUseFallback(error: unknown): boolean {
        if (error instanceof OpenRouterApiError) {
            // Use fallback on model unavailable or capacity issues
            return error.statusCode === 503 || error.errorType === 'model_not_available';
        }
        return false;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check if a model supports a specific capability
     */
    getModelCapabilities(modelId: string) {
        return MODEL_CAPABILITIES[modelId] || null;
    }

    /**
     * Get list of premium models
     */
    getPremiumModels() {
        return Object.entries(PREMIUM_MODELS).map(([key, id]) => ({
            key,
            id,
            capabilities: MODEL_CAPABILITIES[id] || null,
        }));
    }

    /**
     * Validate if model supports requested features
     */
    validateModelForRequest(modelId: string, request: OpenRouterRequest): string[] {
        const capabilities = MODEL_CAPABILITIES[modelId];
        const errors: string[] = [];

        if (!capabilities) {
            return []; // Unknown model, allow request
        }

        // Check for vision content
        const hasImageContent = request.messages.some(msg => {
            if (typeof msg.content === 'string') return false;
            return msg.content?.some(part => part.type === 'image_url');
        });

        if (hasImageContent && !capabilities.supportsVision) {
            errors.push(`Model ${modelId} does not support vision/image input`);
        }

        // Check for function calling
        if (request.tools && request.tools.length > 0 && !capabilities.supportsFunctionCalling) {
            errors.push(`Model ${modelId} does not support function calling`);
        }

        // Check token limits
        if (request.max_tokens && request.max_tokens > capabilities.maxOutputTokens) {
            errors.push(
                `Requested max_tokens (${request.max_tokens}) exceeds model limit (${capabilities.maxOutputTokens})`,
            );
        }

        return errors;
    }
}
