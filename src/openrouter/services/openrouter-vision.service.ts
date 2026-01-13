/**
 * OpenRouter Vision Service
 * Image analysis using vision-capable models
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PREMIUM_MODELS, MODEL_CAPABILITIES } from '../types/openrouter.types';
import { VisionRequestDto, VisionResponseDto } from '../dto/multimodal-request.dto';

@Injectable()
export class OpenRouterVisionService {
    private readonly logger = new Logger(OpenRouterVisionService.name);
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly siteUrl: string;
    private readonly siteName: string;

    // Vision-capable models in order of preference
    private readonly visionModels = [
        PREMIUM_MODELS.CLAUDE_OPUS_4_5,
        PREMIUM_MODELS.CLAUDE_SONNET_4_5,
        PREMIUM_MODELS.GPT_4O,
        PREMIUM_MODELS.GEMINI_2_5_PRO,
    ];

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY', '');
        this.baseUrl = this.configService.get<string>('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1');
        this.siteUrl = this.configService.get<string>('OPENROUTER_SITE_URL', 'https://orenax.com');
        this.siteName = this.configService.get<string>('OPENROUTER_SITE_NAME', 'OrenaX AI Platform');
    }

    /**
     * Analyze images using vision-capable models
     */
    async analyzeImages(request: VisionRequestDto): Promise<VisionResponseDto> {
        const model = request.model || PREMIUM_MODELS.GPT_4O;

        // Validate model supports vision
        const capabilities = MODEL_CAPABILITIES[model];
        if (capabilities && !capabilities.supportsVision) {
            throw new HttpException(
                `Model ${model} does not support vision. Use one of: ${this.visionModels.join(', ')}`,
                HttpStatus.BAD_REQUEST,
            );
        }

        this.logger.log(`Vision analysis request - Model: ${model}, Images: ${request.images.length}`);

        // Build content array with images
        const contentParts = request.images.map(img => ({
            type: 'image_url' as const,
            image_url: {
                url: img.url,
                detail: img.detail || 'auto',
            },
        }));

        // Add text prompt
        contentParts.push({
            type: 'text' as const,
            text: request.prompt,
        } as any);

        const messages: any[] = [];

        // Add system prompt if provided
        if (request.system_prompt) {
            messages.push({
                role: 'system',
                content: request.system_prompt,
            });
        }

        messages.push({
            role: 'user',
            content: contentParts,
        });

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': this.siteUrl,
                    'X-Title': this.siteName,
                },
                body: JSON.stringify({
                    model,
                    messages,
                    max_tokens: request.max_tokens || 4096,
                    temperature: request.temperature || 0.7,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new HttpException(
                    error.error?.message || 'Vision analysis failed',
                    response.status,
                );
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';

            this.logger.log(`Vision analysis complete - Tokens: ${data.usage?.total_tokens || 'N/A'}`);

            return {
                content,
                model: data.model,
                usage: data.usage,
                images_processed: request.images.length,
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;

            this.logger.error(`Vision analysis error: ${error.message}`);
            throw new HttpException(
                `Vision analysis failed: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Get list of vision-capable models
     */
    getVisionModels(): string[] {
        return this.visionModels;
    }

    /**
     * Check if a model supports vision
     */
    supportsVision(modelId: string): boolean {
        const capabilities = MODEL_CAPABILITIES[modelId];
        return capabilities?.supportsVision || this.visionModels.includes(modelId as any);
    }
}
