/**
 * OpenRouter Audio Service
 * Audio processing using audio-capable models
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PREMIUM_MODELS } from '../types/openrouter.types';
import { AudioRequestDto, AudioResponseDto } from '../dto/multimodal-request.dto';

@Injectable()
export class OpenRouterAudioService {
    private readonly logger = new Logger(OpenRouterAudioService.name);
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly siteUrl: string;
    private readonly siteName: string;

    // Audio-capable models
    private readonly audioModels = [
        PREMIUM_MODELS.GPT_4O_AUDIO,
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
     * Process audio using audio-capable models
     */
    async processAudio(request: AudioRequestDto): Promise<AudioResponseDto> {
        const model = request.model || PREMIUM_MODELS.GPT_4O_AUDIO;
        const task = request.task || 'transcribe';

        this.logger.log(`Audio processing request - Model: ${model}, Task: ${task}`);

        // Build the prompt based on task
        let systemPrompt = request.system_prompt || '';
        let userPrompt = request.prompt;

        switch (task) {
            case 'transcribe':
                systemPrompt = systemPrompt || 'You are an expert transcriptionist. Transcribe the audio accurately.';
                break;
            case 'analyze':
                systemPrompt = systemPrompt || 'You are an audio analysis expert. Analyze the audio content in detail.';
                break;
            case 'summarize':
                systemPrompt = systemPrompt || 'You are an expert at summarizing audio content. Provide a concise summary.';
                break;
            case 'translate':
                const targetLang = request.target_language || 'English';
                systemPrompt = systemPrompt || `You are a professional translator. Translate the audio content to ${targetLang}.`;
                break;
        }

        // Build content with audio
        const contentParts = [
            {
                type: 'audio_url',
                audio_url: {
                    url: request.audio.url,
                },
            },
            {
                type: 'text',
                text: userPrompt,
            },
        ];

        const messages: any[] = [];

        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: systemPrompt,
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
                    max_tokens: 8192,
                    temperature: 0.3, // Lower temperature for accuracy
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new HttpException(
                    error.error?.message || 'Audio processing failed',
                    response.status,
                );
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';

            this.logger.log(`Audio processing complete - Tokens: ${data.usage?.total_tokens || 'N/A'}`);

            return {
                content,
                transcription: task === 'transcribe' ? content : undefined,
                model: data.model,
                usage: data.usage,
                task,
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;

            this.logger.error(`Audio processing error: ${error.message}`);
            throw new HttpException(
                `Audio processing failed: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Get list of audio-capable models
     */
    getAudioModels(): string[] {
        return this.audioModels;
    }

    /**
     * Check if a model supports audio
     */
    supportsAudio(modelId: string): boolean {
        return this.audioModels.includes(modelId as any);
    }
}
