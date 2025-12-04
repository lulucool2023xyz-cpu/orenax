import { Injectable, Logger } from '@nestjs/common';
import { GenerationService } from '../vertex-ai/services/generation.service';
import { StreamingService } from '../vertex-ai/services/streaming.service';
import { ConversationService } from '../vertex-ai/services/conversation.service';
import { VertexAiConfigService } from '../vertex-ai/config/vertex-ai.config';
import { GeminiModelId } from '../vertex-ai/types/constants';
import { ChatRequestDto, CountTokensRequestDto } from '../vertex-ai/dto/chat-request.dto';
import { ChatResponseDto, CountTokensResponseDto } from '../vertex-ai/dto/chat-response.dto';
import type { Response } from 'express';

/**
 * Chat Service
 * Orchestrates Vertex AI services for chat functionality
 */
@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    constructor(
        private readonly generationService: GenerationService,
        private readonly streamingService: StreamingService,
        private readonly conversationService: ConversationService,
        private readonly config: VertexAiConfigService,
    ) { }

    /**
     * Process chat request
     */
    async chat(
        chatRequest: ChatRequestDto,
        userId: string,
        conversationId?: string,
    ): Promise<ChatResponseDto> {
        try {
            const model = (chatRequest.model || this.config.getDefaultModel()) as GeminiModelId;

            // If no conversation ID, create new conversation
            let convId = conversationId;
            if (!convId) {
                const firstMessage = chatRequest.messages[0]?.content || 'New Chat';
                const title = firstMessage.substring(0, 50);
                convId = await this.conversationService.createConversation(
                    userId,
                    model,
                    title,
                );
            }

            // Save user messages to conversation
            for (const message of chatRequest.messages) {
                if (message.role === 'user') {
                    await this.conversationService.addMessage(
                        convId,
                        'user',
                        message.content,
                    );
                }
            }

            // Generate response with all features
            const response = await this.generationService.generateContent(
                chatRequest.messages,
                model,
                chatRequest.generationConfig,
                chatRequest.systemInstruction === undefined,
                chatRequest.thinkingConfig, // Thinking mode
                chatRequest.multimodalContents, // Image/document understanding
                chatRequest.groundingConfig, // Google Search/Maps
            );

            const responseText = this.generationService.extractTextFromResponse(response);
            const thoughts = this.generationService.extractThoughts(response);

            // Get grounding metadata from response (enhanced by generation service)
            const groundingMetadata = (response as any).groundingMetadata;

            // Save model response to conversation
            await this.conversationService.addMessage(
                convId,
                'model',
                responseText,
                {
                    finishReason: response.candidates[0]?.finishReason,
                    usageMetadata: response.usageMetadata,
                    thoughts: thoughts.length > 0 ? thoughts : undefined,
                    groundingMetadata: groundingMetadata,
                },
            );

            return {
                message: {
                    role: 'model',
                    content: responseText,
                    finishReason: response.candidates[0]?.finishReason,
                    thoughts: thoughts.length > 0 ? thoughts : undefined,
                },
                usageMetadata: response.usageMetadata,
                groundingMetadata: groundingMetadata,
                model,
                conversationId: convId,
            };
        } catch (error) {
            this.logger.error('Chat error:', error);
            throw error;
        }
    }

    /**
     * Stream chat response
     */
    async streamChat(
        res: Response,
        chatRequest: ChatRequestDto,
        userId: string,
        conversationId?: string,
    ): Promise<void> {
        const model = (chatRequest.model || this.config.getDefaultModel()) as GeminiModelId;

        // Save user message to conversation
        if (conversationId) {
            for (const message of chatRequest.messages) {
                if (message.role === 'user') {
                    await this.conversationService.addMessage(
                        conversationId,
                        'user',
                        message.content,
                    );
                }
            }
        }

        await this.streamingService.streamGenerateContent(
            res,
            chatRequest.messages,
            model,
            chatRequest.generationConfig,
        );
    }

    /**
     * Count tokens
     */
    async countTokens(
        countRequest: CountTokensRequestDto,
    ): Promise<CountTokensResponseDto> {
        const model = (countRequest.model || this.config.getDefaultModel()) as GeminiModelId;

        const result = await this.generationService.countTokens(
            countRequest.messages,
            model,
        );

        return {
            totalTokens: result.totalTokens,
            model: result.model,
        };
    }

    /**
     * Get conversation history
     */
    async getConversationHistory(
        conversationId: string,
        userId: string,
    ): Promise<any[]> {
        return this.conversationService.getConversationHistory(conversationId, userId);
    }

    /**
     * List conversations
     */
    async listConversations(userId: string): Promise<any[]> {
        return this.conversationService.listConversations(userId);
    }

    /**
     * Delete conversation
     */
    async deleteConversation(conversationId: string, userId: string): Promise<void> {
        await this.conversationService.deleteConversation(conversationId, userId);
    }
}
