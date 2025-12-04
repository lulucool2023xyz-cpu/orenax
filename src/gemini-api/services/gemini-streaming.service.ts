import { Injectable, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { GeminiGenerationService } from './gemini-generation.service';
import { GeminiChatRequestDto } from '../dto/gemini-chat-request.dto';

/**
 * Gemini Streaming Service
 * Handles SSE streaming responses
 */
@Injectable()
export class GeminiStreamingService {
    private readonly logger = new Logger(GeminiStreamingService.name);

    constructor(
        private readonly generationService: GeminiGenerationService,
    ) { }

    /**
     * Stream response via SSE
     */
    async streamResponse(
        res: Response,
        request: GeminiChatRequestDto,
    ): Promise<void> {
        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        try {
            // Stream chunks from generation service
            for await (const chunk of this.generationService.generateContentStream(request)) {
                // Send SSE event
                const data = JSON.stringify({
                    text: chunk.text,
                    thought: chunk.thought,
                    done: chunk.done,
                    finishReason: chunk.finishReason,
                    usageMetadata: chunk.usageMetadata,
                });

                res.write(`data: ${data}\n\n`);

                // If done, send final event
                if (chunk.done) {
                    res.write('data: [DONE]\n\n');
                    break;
                }
            }

            res.end();
        } catch (error) {
            this.logger.error('Streaming error:', error);

            // Send error event
            const errorData = JSON.stringify({
                error: true,
                message: error.message || 'Streaming error occurred',
            });
            res.write(`data: ${errorData}\n\n`);
            res.end();
        }
    }

    /**
     * Stream response with custom callback
     */
    async streamWithCallback(
        request: GeminiChatRequestDto,
        onChunk: (chunk: any) => void,
        onDone: (result: any) => void,
        onError: (error: Error) => void,
    ): Promise<void> {
        try {
            let fullText = '';
            let usageMetadata: any;
            let finishReason: string | undefined;

            for await (const chunk of this.generationService.generateContentStream(request)) {
                // Accumulate text
                if (chunk.text) {
                    fullText += chunk.text;
                }

                // Store final metadata
                if (chunk.done) {
                    usageMetadata = chunk.usageMetadata;
                    finishReason = chunk.finishReason;
                }

                // Call chunk callback
                onChunk(chunk);
            }

            // Call done callback
            onDone({
                text: fullText,
                finishReason,
                usageMetadata,
            });
        } catch (error) {
            onError(error);
        }
    }
}
