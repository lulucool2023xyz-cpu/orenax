import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { GenerationService } from './generation.service';
import { GeminiModelId } from '../types/constants';

/**
 * Streaming Service for Vertex AI
 * Handles Server-Sent Events (SSE) for streaming responses
 */
@Injectable()
export class StreamingService {
    private readonly logger = new Logger(StreamingService.name);

    constructor(private readonly generationService: GenerationService) { }

    /**
     * Stream generate content
     * Uses Server-Sent Events (SSE) to stream responses
     */
    async streamGenerateContent(
        res: Response,
        messages: { role: string; content: string }[],
        modelId?: GeminiModelId,
        generationConfig?: any,
    ): Promise<void> {
        try {
            // Set SSE headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            this.logger.log('Starting streaming response');

            // For now, we'll simulate streaming by chunking the response
            // In a future implementation, we can use actual streaming from Vertex AI
            const result = await this.generationService.generateContent(
                messages,
                modelId,
                generationConfig,
            );

            const text = this.generationService.extractTextFromResponse(result);

            // Stream the text in chunks
            const chunkSize = 10; // characters per chunk
            for (let i = 0; i < text.length; i += chunkSize) {
                const chunk = text.slice(i, i + chunkSize);

                const data = {
                    content: chunk,
                    done: i + chunkSize >= text.length,
                    usageMetadata: i + chunkSize >= text.length ? result.usageMetadata : undefined,
                };

                res.write(`data: ${JSON.stringify(data)}\n\n`);

                // Small delay to simulate streaming
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            res.write('data: [DONE]\n\n');
            res.end();

            this.logger.log('Streaming completed');
        } catch (error) {
            this.logger.error('Streaming error:', error);

            const errorData = {
                error: error.message || 'Streaming failed',
                done: true,
            };

            res.write(`data: ${JSON.stringify(errorData)}\n\n`);
            res.end();
        }
    }

    /**
     * Create SSE event data
     */
    private createEventData(chunk: string, done: boolean, metadata?: any): string {
        const data = {
            content: chunk,
            done,
            ...(metadata && { usageMetadata: metadata }),
        };

        return `data: ${JSON.stringify(data)}\n\n`;
    }
}
