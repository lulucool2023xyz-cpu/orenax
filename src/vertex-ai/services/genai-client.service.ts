import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Google GenAI Client Service
 * 
 * Modern client using @google/genai SDK for Vertex AI integration
 * Supports all Gemini models including 3 Pro, 2.5 Pro/Flash, and 2.0 variants
 * 
 * Features:
 * - Vertex AI integration with automatic authentication
 * - Support for all grounding options (Search, Maps, Vertex AI Search)
 * - Thinking mode support (thinkingLevel for Gemini 3, thinkingBudget for 2.5)
 * - Streaming and non-streaming generation
 */
@Injectable()
export class GenAIClientService implements OnModuleInit {
    private readonly logger = new Logger(GenAIClientService.name);
    private client: any;
    private isInitialized = false;

    constructor(private readonly configService: ConfigService) { }

    async onModuleInit() {
        await this.initializeClient();
    }

    /**
     * Initialize the GenAI client
     */
    private async initializeClient(): Promise<void> {
        try {
            // Dynamic import for @google/genai
            const { GoogleGenAI } = await import('@google/genai');

            const projectId = this.configService.get<string>('GOOGLE_CLOUD_PROJECT');
            const location = this.configService.get<string>('GOOGLE_CLOUD_LOCATION') || 'global';

            if (!projectId) {
                this.logger.warn('GOOGLE_CLOUD_PROJECT not set, GenAI client not initialized');
                return;
            }

            this.client = new GoogleGenAI({
                vertexai: true,
                project: projectId,
                location: location,
            });

            this.isInitialized = true;
            this.logger.log(`GenAI client initialized for project: ${projectId}, location: ${location}`);
        } catch (error) {
            this.logger.error('Failed to initialize GenAI client:', error);
        }
    }

    /**
     * Get the GenAI client instance
     */
    getClient(): any {
        if (!this.isInitialized) {
            throw new Error('GenAI client not initialized');
        }
        return this.client;
    }

    /**
     * Check if client is ready
     */
    isReady(): boolean {
        return this.isInitialized;
    }

    /**
     * Generate content using the new SDK
     */
    async generateContent(options: {
        model: string;
        contents: any;
        config?: {
            temperature?: number;
            topP?: number;
            topK?: number;
            maxOutputTokens?: number;
            thinkingConfig?: {
                thinkingLevel?: 'LOW' | 'HIGH';
                thinkingBudget?: number;
            };
            tools?: any[];
            safetySettings?: any[];
            systemInstruction?: string;
            responseModalities?: string[];
        };
    }): Promise<any> {
        if (!this.isInitialized) {
            throw new Error('GenAI client not initialized');
        }

        const { model, contents, config } = options;

        try {
            const response = await this.client.models.generateContent({
                model,
                contents,
                config: {
                    ...config,
                    generationConfig: {
                        temperature: config?.temperature,
                        topP: config?.topP,
                        topK: config?.topK,
                        maxOutputTokens: config?.maxOutputTokens,
                        thinkingConfig: config?.thinkingConfig,
                        responseModalities: config?.responseModalities,
                    },
                    tools: config?.tools,
                    safetySettings: config?.safetySettings,
                    systemInstruction: config?.systemInstruction,
                },
            });

            return response;
        } catch (error) {
            this.logger.error(`Generation failed for model ${model}:`, error);
            throw error;
        }
    }

    /**
     * Generate content with Google Search grounding
     */
    async generateWithSearchGrounding(options: {
        model: string;
        contents: any;
        temperature?: number;
    }): Promise<any> {
        // Google Search grounding uses simple tool object
        return this.generateContent({
            model: options.model,
            contents: options.contents,
            config: {
                temperature: options.temperature || 1.0,
                tools: [
                    { google_search: {} }
                ],
            },
        });
    }

    /**
     * Generate content with Google Maps grounding
     */
    async generateWithMapsGrounding(options: {
        model: string;
        contents: any;
        latitude: number;
        longitude: number;
        enableWidget?: boolean;
    }): Promise<any> {
        return this.generateContent({
            model: options.model,
            contents: options.contents,
            config: {
                tools: [
                    {
                        googleMaps: {
                            latitude: options.latitude,
                            longitude: options.longitude,
                            enableWidget: options.enableWidget || false,
                        }
                    }
                ],
            },
        });
    }

    /**
     * Generate content with Vertex AI Search grounding
     */
    async generateWithVertexSearch(options: {
        model: string;
        contents: any;
        datastoreId: string;
    }): Promise<any> {
        return this.generateContent({
            model: options.model,
            contents: options.contents,
            config: {
                tools: [
                    {
                        retrieval: {
                            vertexAiSearch: {
                                datastore: options.datastoreId,
                            }
                        }
                    }
                ],
            },
        });
    }

    /**
     * Generate image using Gemini Image models
     */
    async generateImage(options: {
        model: string;
        prompt: string;
        aspectRatio?: string;
    }): Promise<any> {
        return this.generateContent({
            model: options.model,
            contents: options.prompt,
            config: {
                responseModalities: ['IMAGE', 'TEXT'],
            },
        });
    }

    /**
     * Stream content generation
     */
    async *streamContent(options: {
        model: string;
        contents: any;
        config?: any;
    }): AsyncGenerator<any> {
        if (!this.isInitialized) {
            throw new Error('GenAI client not initialized');
        }

        try {
            const stream = await this.client.models.generateContentStream({
                model: options.model,
                contents: options.contents,
                config: options.config,
            });

            for await (const chunk of stream) {
                yield chunk;
            }
        } catch (error) {
            this.logger.error('Stream generation failed:', error);
            throw error;
        }
    }
}
