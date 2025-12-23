import { Injectable, Logger } from '@nestjs/common';
import { AiConfigService } from '../config/ai-config.service';
import { AiStrategyFactory } from './ai-strategy.factory';
import { AiDtoMapperService } from './ai-dto-mapper.service';
import { AiChatOptions, AiChatResponse, AiChatMessage, AiStreamChunk } from '../interfaces/ai-chat.interface';
import { AiModelId } from '../constants/ai-models';

@Injectable()
export class AiGenerationService {
    private readonly logger = new Logger(AiGenerationService.name);

    constructor(
        private readonly config: AiConfigService,
        private readonly strategyFactory: AiStrategyFactory,
        private readonly mapper: AiDtoMapperService,
    ) { }

    /**
     * Unified generate content method
     */
    async generateChat(
        messages: AiChatMessage[],
        options: AiChatOptions = {},
    ): Promise<AiChatResponse> {
        const modelId = options.model || this.config.getDefaultModel();
        const provider = this.strategyFactory.getProviderForModel(modelId);

        this.logger.debug(`Generating chat using ${provider} provider with model ${modelId}`);

        if (provider === 'gemini') {
            return this.generateWithGemini(messages, options, modelId);
        } else {
            return this.generateWithVertex(messages, options, modelId);
        }
    }

    /**
     * Unified streaming method
     */
    async *generateChatStream(
        messages: AiChatMessage[],
        options: AiChatOptions = {},
    ): AsyncGenerator<AiStreamChunk> {
        const modelId = options.model || this.config.getDefaultModel();
        const provider = this.strategyFactory.getProviderForModel(modelId);

        if (provider === 'gemini') {
            yield* this.streamWithGemini(messages, options, modelId);
        } else {
            yield* this.streamWithVertex(messages, options, modelId);
        }
    }

    /**
     * Gemini SDK Implementation
     */
    private async generateWithGemini(
        messages: AiChatMessage[],
        options: AiChatOptions,
        modelId: string
    ): Promise<AiChatResponse> {
        const genAI = this.config.getGeminiClient();
        const modelOptions: any = { model: modelId };

        if (options.systemInstruction) {
            modelOptions.systemInstruction = options.systemInstruction;
        }

        const model = genAI.getGenerativeModel(modelOptions);
        const contents = this.formatMessagesForGemini(messages);

        const generationConfig: any = {
            temperature: options.temperature,
            maxOutputTokens: options.maxOutputTokens,
            topP: options.topP,
            topK: options.topK,
            stopSequences: options.stopSequences,
        };

        const result = await model.generateContent({
            contents,
            generationConfig,
        });

        const response = result.response;
        const candidate = response.candidates?.[0];

        // Extract thoughts if available
        const thoughts = candidate?.content?.parts
            ?.filter((p: any) => p.thought === true)
            ?.map((p: any) => p.text) || [];

        return {
            text: response.text(),
            thoughts: thoughts.length > 0 ? thoughts : undefined,
            finishReason: candidate?.finishReason || 'STOP',
            usage: {
                promptTokens: response.usageMetadata?.promptTokenCount || 0,
                completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
                totalTokens: response.usageMetadata?.totalTokenCount || 0,
            },
            grounding: candidate?.groundingMetadata,
            model: modelId,
        };
    }

    /**
     * Gemini SDK Streaming Implementation
     */
    private async *streamWithGemini(
        messages: AiChatMessage[],
        options: AiChatOptions,
        modelId: string
    ): AsyncGenerator<AiStreamChunk> {
        const genAI = this.config.getGeminiClient();
        const modelOptions: any = { model: modelId };

        if (options.systemInstruction) {
            modelOptions.systemInstruction = options.systemInstruction;
        }

        const model = genAI.getGenerativeModel(modelOptions);
        const contents = this.formatMessagesForGemini(messages);

        const result = await model.generateContentStream({
            contents,
            generationConfig: {
                temperature: options.temperature,
                maxOutputTokens: options.maxOutputTokens,
            },
        });

        for await (const chunk of result.stream) {
            const candidate = chunk.candidates?.[0];
            const parts = candidate?.content?.parts || [];

            let text = '';
            let thought = '';

            for (const part of parts) {
                const typedPart = part as any;
                if (typedPart.thought === true) {
                    thought += typedPart.text || '';
                } else {
                    text += typedPart.text || '';
                }
            }

            yield {
                text: text || undefined,
                thought: thought || undefined,
                done: !!candidate?.finishReason,
                finishReason: candidate?.finishReason,
            };
        }

        const finalResponse = await result.response;
        yield {
            done: true,
            usage: {
                promptTokens: finalResponse.usageMetadata?.promptTokenCount,
                completionTokens: finalResponse.usageMetadata?.candidatesTokenCount,
                totalTokens: finalResponse.usageMetadata?.totalTokenCount,
            },
        };
    }

    /**
     * Vertex AI Implementation (Delegates to legacy for now, will be migrated)
     */
    private async generateWithVertex(messages: AiChatMessage[], options: AiChatOptions, modelId: string): Promise<AiChatResponse> {
        throw new Error('Vertex provider logic migration in progress. Please use Gemini for now.');
    }

    private async *streamWithVertex(messages: AiChatMessage[], options: AiChatOptions, modelId: string): AsyncGenerator<AiStreamChunk> {
        throw new Error('Vertex streaming logic migration in progress. Please use Gemini for now.');
    }

    /**
     * Format internal messages to Gemini SDK format
     */
    private formatMessagesForGemini(messages: AiChatMessage[]): any[] {
        return messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : m.role,
            parts: m.parts || [{ text: m.content }],
        }));
    }
}
