import { Injectable, Logger } from '@nestjs/common';
import { PredictionServiceClient } from '@google-cloud/aiplatform';
import { google } from '@google-cloud/aiplatform/build/protos/protos';
import * as path from 'path';
import { VertexAiConfigService } from '../config/vertex-ai.config';
import { ThinkingService } from './thinking.service';
import { MultimodalService } from './multimodal.service';
import { GroundingService } from './grounding.service';
import { VertexAiErrorHandler, RetryUtil } from '../utils/error-handler.util';
import { TokenCounterUtil } from '../utils/token-counter.util';
import {
    GenerateContentResponse,
    Content,
    Part,
} from '../types/vertex-ai.types';
import {
    DEFAULT_GENERATION_CONFIG,
    DEFAULT_SAFETY_SETTINGS,
    ORENAX_SYSTEM_INSTRUCTION,
} from '../types/constants';
import { GeminiModelId } from '../types/constants';
import { ThinkingConfigDto } from '../dto/thinking-config.dto';
import { MultimodalContentDto } from '../dto/multimodal-content.dto';

type IGenerateContentRequest = google.cloud.aiplatform.v1.IGenerateContentRequest;

/**
 * Core Generation Service for Vertex AI
 * Handles content generation with all phase features
 */
@Injectable()
export class GenerationService {
    private readonly logger = new Logger(GenerationService.name);
    private client: PredictionServiceClient;

    constructor(
        private readonly config: VertexAiConfigService,
        private readonly thinkingService: ThinkingService,
        private readonly multimodalService: MultimodalService,
        private readonly groundingService: GroundingService,
    ) {
        this.initializeClient();
    }

    /**
     * Initialize Prediction Service Client
     */
    private initializeClient(): void {
        try {
            const credentialsPath = this.config.getCredentialsPath();

            // Resolve to absolute path from project root
            const absolutePath = path.isAbsolute(credentialsPath)
                ? credentialsPath
                : path.resolve(process.cwd(), credentialsPath);

            this.logger.log(`Loading credentials from: ${absolutePath}`);
            const credentials = require(absolutePath);

            this.client = new PredictionServiceClient({
                apiEndpoint: `${this.config.getLocation()}-${this.config.getApiEndpoint()}`,
                credentials,
            });

            this.logger.log('Vertex AI PredictionServiceClient initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize PredictionServiceClient:', error);
            throw error;
        }
    }

    /**
     * Generate content using Vertex AI (all phases)
     */
    async generateContent(
        messages: { role: string; content: string }[],
        modelId?: GeminiModelId,
        generationConfig?: any,
        useSystemInstruction: boolean = true,
        thinkingConfig?: ThinkingConfigDto,
        multimodalContents?: MultimodalContentDto[],
        groundingConfig?: any, // Phase 3: Grounding
    ): Promise<GenerateContentResponse> {
        try {
            const modelName = (modelId || this.config.getDefaultModel()) as string;
            const endpoint = this.config.getModelPath(modelName as GeminiModelId);

            // Convert messages to Vertex AI Content format
            let contents: Content[];

            // Phase 2: Use multimodal contents if provided
            if (multimodalContents && multimodalContents.length > 0) {
                this.multimodalService.validateMultimodalContents(multimodalContents);
                const parts = this.multimodalService.convertToPartobjects(multimodalContents);
                contents = [{ role: 'user', parts }];
                this.logger.log(`Using multimodal content: ${multimodalContents.length} items`);
            } else {
                contents = this.convertMessagesToContents(messages);
            }

            // System instruction
            const systemInstruction = useSystemInstruction ? ORENAX_SYSTEM_INSTRUCTION : undefined;

            // Base generation config
            const baseConfig = {
                ...DEFAULT_GENERATION_CONFIG,
                ...generationConfig,
            };

            // Phase 2: Add thinking config if provided (Gemini 2.5 with thinkingBudget)
            if (thinkingConfig) {
                const isValid = this.thinkingService.validateThinkingConfig(
                    modelName as GeminiModelId,
                    thinkingConfig,
                );
                if (isValid) {
                    const thinkingMerge = this.thinkingService.prepareThinkingConfig(
                        modelName as GeminiModelId,
                        thinkingConfig,
                    );
                    if (thinkingMerge && thinkingMerge.thinkingConfig) {
                        Object.assign(baseConfig, thinkingMerge.thinkingConfig);
                    }
                }
            }

            // Phase 3: Prepare grounding tools if provided
            let tools: any = undefined;
            if (groundingConfig) {
                tools = this.groundingService.prepareGroundingTools(groundingConfig);
                if (tools && tools.length > 0) {
                    this.logger.log(`Added ${tools.length} grounding tool(s): ${JSON.stringify(tools)}`);
                } else {
                    this.logger.warn('Grounding config provided but no tools were created');
                }
            }

            // Prepare request
            const request: IGenerateContentRequest = {
                model: endpoint,
                contents: contents as any,
                generationConfig: baseConfig as any,
                safetySettings: DEFAULT_SAFETY_SETTINGS as any,
                systemInstruction: systemInstruction as any,
                tools: tools as any,
            };

            this.logger.log(`Generating content with model: ${modelName}`);

            // Call Vertex AI with retry
            const [response] = await RetryUtil.withRetry(async () => {
                return await this.client.generateContent(request);
            });

            // Parse response
            const result: GenerateContentResponse = {
                candidates: response.candidates as any || [],
                usageMetadata: response.usageMetadata as any,
                promptFeedback: response.promptFeedback as any,
            };

            // Extract grounding metadata if grounding was used
            if (groundingConfig) {
                const groundingMetadata = this.groundingService.extractGroundingMetadata(response);
                if (groundingMetadata) {
                    (result as any).groundingMetadata = groundingMetadata;
                    this.logger.log('Grounding metadata extracted successfully');
                }
            }

            // Log token usage
            if (result.usageMetadata) {
                this.logger.log(
                    TokenCounterUtil.formatTokenUsage(
                        result.usageMetadata.promptTokenCount,
                        result.usageMetadata.candidatesTokenCount,
                    ),
                );
            }

            return result;
        } catch (error) {
            VertexAiErrorHandler.logError('generateContent', error);
            VertexAiErrorHandler.handleError(error);
        }
    }

    /**
     * Count tokens for a set of messages
     */
    async countTokens(
        messages: { role: string; content: string }[],
        modelId?: GeminiModelId,
    ): Promise<{ totalTokens: number; model: string }> {
        const modelName = (modelId || this.config.getDefaultModel()) as string;
        const contents = this.convertMessagesToContents(messages);
        const totalTokens = TokenCounterUtil.estimateConversationTokens(contents);

        this.logger.log(`Estimated tokens: ${totalTokens} for model: ${modelName}`);

        return { totalTokens, model: modelName };
    }

    /**
     * Convert simple messages to Vertex AI Content format
     */
    private convertMessagesToContents(
        messages: { role: string; content: string }[],
    ): Content[] {
        return messages.map((msg) => ({
            role: msg.role as 'user' | 'model',
            parts: [{ text: msg.content }],
        }));
    }

    /**
     * Extract text from response
     */
    extractTextFromResponse(response: GenerateContentResponse): string {
        if (!response.candidates || response.candidates.length === 0) {
            return '';
        }

        const candidate = response.candidates[0];
        const parts = candidate.content?.parts || [];

        return parts
            .filter((part: Part) => part.text)
            .map((part: Part) => part.text)
            .join('');
    }

    /**
     * Extract thinking thoughts from response (for Gemini 2.5 with thinking mode)
     */
    extractThoughts(response: GenerateContentResponse): string[] {
        const thoughts: string[] = [];

        if (!response.candidates || response.candidates.length === 0) {
            return thoughts;
        }

        const candidate = response.candidates[0];

        // Check for thought parts in content
        if (candidate.content?.parts) {
            for (const part of candidate.content.parts) {
                // Gemini 2.5 includes thoughts in separate parts
                if ((part as any).thought) {
                    thoughts.push((part as any).thought);
                }
            }
        }

        // Check for thinking metadata
        if ((candidate as any).thinkingMetadata) {
            this.logger.log('Thinking metadata present');
        }

        return thoughts;
    }
}
