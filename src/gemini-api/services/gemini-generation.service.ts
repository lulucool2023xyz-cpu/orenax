import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { GeminiApiConfigService } from '../config/gemini-api.config';
import {
    GeminiChatRequestDto,
    SimpleMessageDto,
    GeminiContentDto,
} from '../dto/gemini-chat-request.dto';
import {
    GeminiChatResponseDto,
    GeminiCountTokensResponseDto,
} from '../dto/gemini-chat-response.dto';
import {
    ERROR_MESSAGES,
    GEMINI_MODELS,
} from '../types';
import type { GeminiModelId, FinishReason } from '../types';

/**
 * Gemini Generation Service
 * Core service for content generation using Gemini API
 */
@Injectable()
export class GeminiGenerationService {
    private readonly logger = new Logger(GeminiGenerationService.name);

    constructor(private readonly config: GeminiApiConfigService) { }

    /**
     * Generate content (non-streaming)
     */
    async generateContent(
        request: GeminiChatRequestDto,
    ): Promise<GeminiChatResponseDto> {
        try {
            // Validate API key
            if (!this.config.isConfigured()) {
                throw new HttpException(
                    ERROR_MESSAGES.MISSING_API_KEY,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            // Get model
            const modelId = (request.model || this.config.getDefaultModel()) as GeminiModelId;
            if (!this.config.isValidModel(modelId)) {
                throw new HttpException(
                    ERROR_MESSAGES.INVALID_MODEL,
                    HttpStatus.BAD_REQUEST,
                );
            }

            // Build generation config
            const generationConfig = this.buildGenerationConfig(request);

            // Build model options
            const modelOptions: any = {
                model: modelId,
            };

            // Add system instruction if provided
            if (request.systemInstruction) {
                modelOptions.systemInstruction = request.systemInstruction;
            }

            // Add safety settings if provided
            if (request.safetySettings && request.safetySettings.length > 0) {
                modelOptions.safetySettings = request.safetySettings;
            }

            // Add generation config
            if (Object.keys(generationConfig).length > 0) {
                modelOptions.generationConfig = generationConfig;
            }

            // Add tools if provided
            if (request.tools && request.tools.length > 0) {
                modelOptions.tools = request.tools;
            }

            // Add tool config if provided
            if (request.toolConfig) {
                modelOptions.toolConfig = request.toolConfig;
            }

            this.logger.debug(`Generating content with model: ${modelId}`);

            // Get model from genAI client
            const genAI = this.config.getClient();
            const model = genAI.getGenerativeModel(modelOptions);

            // Prepare contents/prompt
            const contents = this.prepareContents(request);

            // Call Gemini API
            let response: any;
            if (typeof contents === 'string') {
                // Simple prompt
                response = await model.generateContent(contents);
            } else {
                // Multi-turn chat or complex content
                response = await model.generateContent({ contents });
            }

            // Get the response
            const result = response.response;

            // Parse response
            return this.parseResponse(result, modelId);
        } catch (error) {
            this.logger.error('Error generating content:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Generate content stream (returns async generator)
     * Supports thinking, tools, grounding, and function calling
     */
    async *generateContentStream(
        request: GeminiChatRequestDto,
    ): AsyncGenerator<{
        text?: string;
        thought?: string;
        done: boolean;
        finishReason?: FinishReason;
        usageMetadata?: any;
        functionCall?: { name: string; args: Record<string, unknown> };
        groundingMetadata?: any;
        codeExecutionResult?: any;
    }> {
        try {
            // Validate API key
            if (!this.config.isConfigured()) {
                throw new HttpException(
                    ERROR_MESSAGES.MISSING_API_KEY,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            // Get model
            const modelId = (request.model || this.config.getDefaultModel()) as GeminiModelId;
            if (!this.config.isValidModel(modelId)) {
                throw new HttpException(
                    ERROR_MESSAGES.INVALID_MODEL,
                    HttpStatus.BAD_REQUEST,
                );
            }

            // Build generation config
            const generationConfig = this.buildGenerationConfig(request);

            // Build model options
            const modelOptions: any = {
                model: modelId,
            };

            // Add system instruction if provided
            if (request.systemInstruction) {
                modelOptions.systemInstruction = request.systemInstruction;
            }

            // Add safety settings if provided
            if (request.safetySettings && request.safetySettings.length > 0) {
                modelOptions.safetySettings = request.safetySettings;
            }

            // Add generation config
            if (Object.keys(generationConfig).length > 0) {
                modelOptions.generationConfig = generationConfig;
            }

            // Add tools if provided (Google Search, Code Execution, Function Calling)
            if (request.tools && request.tools.length > 0) {
                modelOptions.tools = request.tools;
            }

            // Add tool config if provided
            if (request.toolConfig) {
                modelOptions.toolConfig = request.toolConfig;
            }

            this.logger.debug(`Streaming content with model: ${modelId}`);

            // Get model from genAI client
            const genAI = this.config.getClient();
            const model = genAI.getGenerativeModel(modelOptions);

            // Prepare contents/prompt
            const contents = this.prepareContents(request);

            // Build request options with thinkingConfig if provided
            const requestOptions: any = typeof contents === 'string'
                ? contents
                : { contents };

            // Add thinkingConfig for thinking models
            if (request.thinkingConfig && typeof requestOptions === 'object') {
                requestOptions.generationConfig = {
                    ...requestOptions.generationConfig,
                    ...this.buildThinkingConfig(request.thinkingConfig, modelId),
                };
            }

            // Call Gemini API with streaming
            let streamingResponse: any;
            if (typeof requestOptions === 'string') {
                streamingResponse = await model.generateContentStream(requestOptions);
            } else {
                streamingResponse = await model.generateContentStream(requestOptions);
            }

            // Yield chunks
            for await (const chunk of streamingResponse.stream) {
                const candidates = chunk.candidates;
                const candidate = candidates?.[0];
                const parts = candidate?.content?.parts || [];

                // Extract text and thoughts from parts
                let textContent: string | undefined;
                let thoughtContent: string | undefined;
                let functionCall: any | undefined;
                let codeExecutionResult: any | undefined;

                for (const part of parts) {
                    // Check if it's a thought part (thinking mode)
                    if (part.thought === true && part.text) {
                        thoughtContent = (thoughtContent || '') + part.text;
                    } else if (part.text) {
                        textContent = (textContent || '') + part.text;
                    }

                    // Check for function calls
                    if (part.functionCall) {
                        functionCall = {
                            name: part.functionCall.name,
                            args: part.functionCall.args,
                        };
                    }

                    // Check for code execution
                    if (part.executableCode || part.codeExecutionResult) {
                        codeExecutionResult = {
                            code: part.executableCode?.code,
                            language: part.executableCode?.language,
                            output: part.codeExecutionResult?.output,
                        };
                    }
                }

                // Fallback to chunk.text() if no parts extracted
                if (!textContent && !thoughtContent) {
                    try {
                        textContent = chunk.text();
                    } catch {
                        // text() might throw if no text
                    }
                }

                // Check for finish reason
                const finishReason = candidate?.finishReason as FinishReason;

                yield {
                    text: textContent,
                    thought: thoughtContent,
                    done: !!finishReason,
                    finishReason,
                    usageMetadata: undefined,
                    functionCall,
                    codeExecutionResult,
                };

                if (finishReason) {
                    break;
                }
            }

            // Get the final aggregated response for usage metadata and grounding
            const finalResponse = await streamingResponse.response;
            const finalCandidate = finalResponse.candidates?.[0];

            yield {
                done: true,
                usageMetadata: finalResponse.usageMetadata,
                groundingMetadata: finalCandidate?.groundingMetadata,
            };
        } catch (error) {
            this.logger.error('Error in streaming:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Build thinking config for thinking models
     */
    private buildThinkingConfig(thinkingConfig: any, modelId: string): any {
        const config: any = {};

        // For Gemini 3 models (thinkingLevel)
        if (modelId.includes('gemini-3')) {
            if (thinkingConfig.thinkingLevel) {
                config.thinkingConfig = {
                    thinkingLevel: thinkingConfig.thinkingLevel,
                };
            }
        }
        // For Gemini 2.5 models (thinkingBudget)
        else if (modelId.includes('gemini-2.5')) {
            if (thinkingConfig.thinkingBudget !== undefined) {
                config.thinkingConfig = {
                    thinkingBudget: thinkingConfig.thinkingBudget,
                };
            }
        }

        // Include thoughts in response if requested
        if (thinkingConfig.includeThoughts) {
            config.thinkingConfig = {
                ...config.thinkingConfig,
                includeThoughts: true,
            };
        }

        return config;
    }



    /**
     * Count tokens
     */
    async countTokens(
        model: GeminiModelId | undefined,
        contents: any,
    ): Promise<GeminiCountTokensResponseDto> {
        try {
            const modelId = model || this.config.getDefaultModel();

            const genAI = this.config.getClient();
            const genModel = genAI.getGenerativeModel({ model: modelId });

            let result: any;
            if (typeof contents === 'string') {
                result = await genModel.countTokens(contents);
            } else {
                result = await genModel.countTokens({ contents });
            }

            return {
                totalTokens: result.totalTokens,
                model: modelId,
            };
        } catch (error) {
            this.logger.error('Error counting tokens:', error);
            // Fallback to estimate
            return {
                totalTokens: this.estimateTokens(contents),
                model: model || this.config.getDefaultModel(),
            };
        }
    }

    /**
     * Prepare contents from various input formats
     */
    private prepareContents(request: GeminiChatRequestDto): string | any[] {
        // If prompt provided (single string) - simplest case
        if (request.prompt) {
            return request.prompt;
        }

        // If contents provided directly
        if (request.contents && request.contents.length > 0) {
            return this.convertContentsDto(request.contents);
        }

        // If messages provided (simple format)
        if (request.messages && request.messages.length > 0) {
            return this.convertMessages(request.messages);
        }

        throw new HttpException(
            'Request must include contents, messages, or prompt',
            HttpStatus.BAD_REQUEST,
        );
    }

    /**
     * Convert ContentsDto to SDK format
     */
    private convertContentsDto(contents: GeminiContentDto[]): any[] {
        return contents.map((content) => ({
            role: content.role,
            parts: content.parts.map((part) => {
                if (part.text) {
                    return { text: part.text };
                }
                if (part.inlineData) {
                    return { inlineData: part.inlineData };
                }
                if (part.fileData) {
                    return { fileData: part.fileData };
                }
                return part;
            }),
        }));
    }

    /**
     * Convert simple messages to SDK format
     */
    private convertMessages(messages: SimpleMessageDto[]): any[] {
        return messages.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.content }],
        }));
    }

    /**
     * Build generation config from request
     */
    private buildGenerationConfig(request: GeminiChatRequestDto): any {
        const config: any = {};

        if (request.generationConfig) {
            const gc = request.generationConfig;
            if (gc.temperature !== undefined) config.temperature = gc.temperature;
            if (gc.topP !== undefined) config.topP = gc.topP;
            if (gc.topK !== undefined) config.topK = gc.topK;
            if (gc.maxOutputTokens !== undefined)
                config.maxOutputTokens = gc.maxOutputTokens;
            if (gc.stopSequences !== undefined)
                config.stopSequences = gc.stopSequences;
            if (gc.candidateCount !== undefined)
                config.candidateCount = gc.candidateCount;
            if (gc.responseMimeType !== undefined)
                config.responseMimeType = gc.responseMimeType;
            if (gc.responseSchema !== undefined)
                config.responseSchema = gc.responseSchema;
        }

        return config;
    }

    /**
     * Parse response from Gemini API
     */
    private parseResponse(response: any, modelId: string): GeminiChatResponseDto {
        const result: GeminiChatResponseDto = {
            text: '',
            finishReason: 'STOP',
            usageMetadata: {
                promptTokenCount: 0,
                candidatesTokenCount: 0,
                totalTokenCount: 0,
            },
            model: modelId,
        };

        // Extract text
        try {
            result.text = response.text();
        } catch (e) {
            // If text() throws, try to get from candidates
            if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
                result.text = response.candidates[0].content.parts[0].text;
            }
        }

        // Extract from candidates
        if (response.candidates && response.candidates.length > 0) {
            const candidate = response.candidates[0];

            // Finish reason
            if (candidate.finishReason) {
                result.finishReason = candidate.finishReason;
            }

            // Safety ratings
            if (candidate.safetyRatings) {
                result.safetyRatings = candidate.safetyRatings;
            }

            // Grounding metadata
            if (candidate.groundingMetadata) {
                result.groundingMetadata = candidate.groundingMetadata;
            }
        }

        // Usage metadata
        if (response.usageMetadata) {
            result.usageMetadata = {
                promptTokenCount: response.usageMetadata.promptTokenCount || 0,
                candidatesTokenCount: response.usageMetadata.candidatesTokenCount || 0,
                thoughtsTokenCount: response.usageMetadata.thoughtsTokenCount,
                totalTokenCount: response.usageMetadata.totalTokenCount || 0,
                cachedContentTokenCount:
                    response.usageMetadata.cachedContentTokenCount,
            };
        }

        // Function calls
        if (response.functionCalls && response.functionCalls.length > 0) {
            result.functionCalls = response.functionCalls;
        }

        return result;
    }

    /**
     * Estimate tokens (simple approximation)
     */
    private estimateTokens(contents: any): number {
        if (typeof contents === 'string') {
            // Rough estimate: 1 token ≈ 4 characters
            return Math.ceil(contents.length / 4);
        }

        if (Array.isArray(contents)) {
            let total = 0;
            for (const content of contents) {
                if (content.parts) {
                    for (const part of content.parts) {
                        if (part.text) {
                            total += Math.ceil(part.text.length / 4);
                        }
                    }
                }
            }
            return total;
        }

        return 0;
    }

    /**
     * Handle errors from Gemini API
     */
    private handleError(error: any): HttpException {
        if (error instanceof HttpException) {
            return error;
        }

        // Parse API errors
        const message = error.message || ERROR_MESSAGES.INTERNAL_ERROR;
        const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;

        // Check for specific error types
        if (message.includes('quota') || message.includes('429')) {
            return new HttpException(
                ERROR_MESSAGES.QUOTA_EXCEEDED,
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        if (message.includes('unauthorized') || message.includes('401')) {
            return new HttpException(
                ERROR_MESSAGES.UNAUTHORIZED,
                HttpStatus.UNAUTHORIZED,
            );
        }

        if (message.includes('safety') || message.includes('blocked')) {
            return new HttpException(
                ERROR_MESSAGES.SAFETY_BLOCKED,
                HttpStatus.BAD_REQUEST,
            );
        }

        return new HttpException(message, statusCode);
    }
}
