import { Injectable, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { GeminiGenerationService } from './gemini-generation.service';
import { GeminiConversationService } from './gemini-conversation.service';
import { GeminiChatRequestDto } from '../dto/gemini-chat-request.dto';

/**
 * Gemini Streaming Service
 * Handles SSE streaming responses with Supabase storage
 */
@Injectable()
export class GeminiStreamingService {
    private readonly logger = new Logger(GeminiStreamingService.name);

    constructor(
        private readonly generationService: GeminiGenerationService,
        private readonly conversationService: GeminiConversationService,
    ) { }

    /**
     * Stream response via SSE and save to Supabase
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

        let fullResponseText = '';
        let usageMetadata: any;
        let finishReason: string | undefined;

        try {
            // Stream chunks from generation service
            for await (const chunk of this.generationService.generateContentStream(request)) {
                // Accumulate text for storage
                if (chunk.text) {
                    fullResponseText += chunk.text;
                }

                // Send SSE event
                const data = JSON.stringify({
                    text: chunk.text,
                    thought: chunk.thought,
                    done: chunk.done,
                    finishReason: chunk.finishReason,
                    usageMetadata: chunk.usageMetadata,
                });

                res.write(`data: ${data}\n\n`);

                // If done, capture metadata
                if (chunk.done) {
                    usageMetadata = chunk.usageMetadata;
                    finishReason = chunk.finishReason;
                    res.write('data: [DONE]\n\n');
                    break;
                }
            }

            res.end();

            // Save to Supabase if userId is provided
            if (request.userId && fullResponseText) {
                await this.saveConversation(request, fullResponseText, usageMetadata, finishReason);
            }
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
     * Save conversation to Supabase after streaming completes
     */
    private async saveConversation(
        request: GeminiChatRequestDto,
        responseText: string,
        usageMetadata?: any,
        finishReason?: string,
    ): Promise<void> {
        try {
            const userId = request.userId!;
            const model = request.model || 'gemini-2.5-flash';

            // Get or create conversation
            let conversationId: string;

            // Extract user message from request
            let userMessage = '';
            if (request.prompt) {
                userMessage = request.prompt;
            } else if (request.messages && request.messages.length > 0) {
                const lastUserMsg = request.messages.filter(m => m.role === 'user').pop();
                userMessage = lastUserMsg?.content || '';
            } else if (request.contents && request.contents.length > 0) {
                const lastUserContent = request.contents.filter(c => c.role === 'user').pop();
                userMessage = lastUserContent?.parts?.map(p => p.text).join('') || '';
            }

            // Create conversation with first message as title
            const title = userMessage.substring(0, 50) || 'Stream Chat';
            conversationId = await this.conversationService.createConversation(userId, model, title);

            // Save user message
            if (userMessage) {
                await this.conversationService.addMessage(conversationId, 'user', userMessage);
            }

            // Save model response
            await this.conversationService.addMessage(conversationId, 'model', responseText, {
                finishReason,
                usageMetadata,
                streaming: true,
            });

            this.logger.log(`Saved streaming conversation ${conversationId} for user ${userId}`);
        } catch (error) {
            this.logger.error('Failed to save conversation:', error);
            // Don't throw - saving is non-critical
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

            // Save to Supabase if userId is provided
            if (request.userId && fullText) {
                await this.saveConversation(request, fullText, usageMetadata, finishReason);
            }
        } catch (error) {
            onError(error);
        }
    }
}

