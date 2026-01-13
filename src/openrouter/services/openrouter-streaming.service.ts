/**
 * OpenRouter Streaming Service
 * Server-Sent Events (SSE) streaming for real-time responses
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import {
    OpenRouterRequest,
    OpenRouterStreamChunk,
    PREMIUM_MODELS,
} from '../types/openrouter.types';

@Injectable()
export class OpenRouterStreamingService {
    private readonly logger = new Logger(OpenRouterStreamingService.name);
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly siteUrl: string;
    private readonly siteName: string;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY', '');
        this.baseUrl = this.configService.get<string>('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1');
        this.siteUrl = this.configService.get<string>('OPENROUTER_SITE_URL', 'https://orenax.com');
        this.siteName = this.configService.get<string>('OPENROUTER_SITE_NAME', 'OrenaX AI Platform');
    }

    /**
     * Stream chat completion via SSE
     */
    async streamChatCompletion(
        request: OpenRouterRequest,
        res: Response,
    ): Promise<void> {
        const model = request.model || PREMIUM_MODELS.CLAUDE_SONNET_4_5;

        this.logger.log(`Streaming chat completion - Model: ${model}`);

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

        const payload: OpenRouterRequest = {
            ...request,
            model,
            stream: true,
        };

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': this.siteUrl,
                    'X-Title': this.siteName,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`OpenRouter streaming error: ${response.status} - ${errorText}`);
                this.sendSSEError(res, `OpenRouter API error: ${response.statusText}`);
                return;
            }

            if (!response.body) {
                this.sendSSEError(res, 'No response body from OpenRouter');
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let totalTokens = 0;

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();

                        if (data === '[DONE]') {
                            this.logger.log(`Streaming complete - Total chunks processed`);
                            res.write('data: [DONE]\n\n');
                            continue;
                        }

                        try {
                            const chunk = JSON.parse(data) as OpenRouterStreamChunk;

                            // Forward the chunk to client
                            res.write(`data: ${JSON.stringify(chunk)}\n\n`);

                            // Log progress periodically
                            totalTokens++;
                        } catch (parseError) {
                            this.logger.warn(`Failed to parse chunk: ${data.substring(0, 100)}`);
                        }
                    }
                }
            }

            res.end();
            this.logger.log(`Stream ended successfully - Chunks: ${totalTokens}`);
        } catch (error) {
            this.logger.error(`Streaming error: ${error.message}`);
            this.sendSSEError(res, error.message);
        }
    }

    /**
     * Send SSE error event
     */
    private sendSSEError(res: Response, message: string): void {
        const errorEvent = {
            error: {
                message,
                type: 'stream_error',
            },
        };
        res.write(`event: error\ndata: ${JSON.stringify(errorEvent)}\n\n`);
        res.end();
    }

    /**
     * Create a streaming response with callback
     * Useful for processing chunks before sending
     */
    async streamWithCallback(
        request: OpenRouterRequest,
        onChunk: (chunk: OpenRouterStreamChunk) => void,
        onComplete: () => void,
        onError: (error: Error) => void,
    ): Promise<void> {
        const model = request.model || PREMIUM_MODELS.CLAUDE_SONNET_4_5;

        const payload: OpenRouterRequest = {
            ...request,
            model,
            stream: true,
        };

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': this.siteUrl,
                    'X-Title': this.siteName,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`OpenRouter API error: ${response.status}`);
            }

            if (!response.body) {
                throw new Error('No response body');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    onComplete();
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();

                        if (data === '[DONE]') {
                            continue;
                        }

                        try {
                            const chunk = JSON.parse(data) as OpenRouterStreamChunk;
                            onChunk(chunk);
                        } catch {
                            // Skip invalid chunks
                        }
                    }
                }
            }
        } catch (error) {
            onError(error);
        }
    }
}
