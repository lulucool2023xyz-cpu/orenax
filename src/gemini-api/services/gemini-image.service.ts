import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GcsStorageService } from '../../vertex-ai/services/gcs-storage.service';
import { MediaStorageService } from '../../supabase/media-storage.service';

/**
 * Image Generation Request DTO
 */
export interface ImageGenerationRequest {
    prompt: string;
    negativePrompt?: string;
    numberOfImages?: number;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
    outputFormat?: 'png' | 'jpeg';
    model?: string;
    uploadToGcs?: boolean; // Upload to GCS (default: true)
    userId?: string; // User ID for tracking
}

/**
 * Image Generation Response
 */
export interface ImageGenerationResponse {
    images: Array<{
        url?: string;
        base64Data?: string;
        mimeType: string;
        filename?: string;
    }>;
    prompt: string;
    model: string;
    generatedAt: string;
}

/**
 * Gemini Image Service
 * Generates images using Gemini AI / Imagen models
 * Now with GCS upload support!
 * 
 * Supported models:
 * - imagen-4.0-generate-001 (default)
 * - imagen-4.0-ultra-generate-001
 * - imagen-4.0-fast-generate-001
 * - imagen-3.0-generate-002
 * - gemini-3-pro-image-preview
 * - gemini-2.5-flash-image
 */
@Injectable()
export class GeminiImageService {
    private readonly logger = new Logger(GeminiImageService.name);
    private genAI: GoogleGenerativeAI;
    private readonly defaultModel = 'imagen-4.0-generate-001';

    constructor(
        private readonly configService: ConfigService,
        private readonly gcsStorage: GcsStorageService,
        private readonly mediaStorage: MediaStorageService,
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.warn('GEMINI_API_KEY not configured - image generation will not work');
        } else {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.logger.log('Gemini Image Service initialized with GCS support');
        }
    }

    /**
     * Generate images from text prompt
     * Uses Gemini models with image generation capabilities
     * Automatically uploads to GCS unless uploadToGcs is false
     */
    async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
        if (!this.genAI) {
            throw new HttpException(
                'Image generation service not configured. Missing GEMINI_API_KEY.',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        try {
            const modelId = request.model || this.defaultModel;
            this.logger.log(`Generating image with model: ${modelId}`);
            this.logger.debug(`Prompt: ${request.prompt.substring(0, 100)}...`);

            // Get the model
            const model = this.genAI.getGenerativeModel({
                model: modelId,
                generationConfig: {
                    responseMimeType: 'text/plain',
                },
            });

            // Build the prompt with negative prompt if provided
            let fullPrompt = `Generate an image: ${request.prompt}`;
            if (request.negativePrompt) {
                fullPrompt += `. Avoid: ${request.negativePrompt}`;
            }
            if (request.aspectRatio) {
                fullPrompt += `. Aspect ratio: ${request.aspectRatio}`;
            }

            // Generate content
            const result = await model.generateContent(fullPrompt);
            const response = result.response;

            // Parse response - collect raw image data
            const rawImages: Array<{
                base64Data: string;
                mimeType: string;
            }> = [];

            if (response.candidates && response.candidates.length > 0) {
                for (const candidate of response.candidates) {
                    if (candidate.content?.parts) {
                        for (const part of candidate.content.parts) {
                            if ((part as any).inlineData) {
                                const inlineData = (part as any).inlineData;
                                rawImages.push({
                                    base64Data: inlineData.data,
                                    mimeType: inlineData.mimeType || 'image/png',
                                });
                            }
                        }
                    }
                }
            }

            // If no images were generated, return empty response
            if (rawImages.length === 0) {
                this.logger.warn('No images generated. Model returned text response.');
                return {
                    images: [],
                    prompt: request.prompt,
                    model: modelId,
                    generatedAt: new Date().toISOString(),
                };
            }

            // Upload to GCS if enabled (default: true)
            const shouldUpload = request.uploadToGcs !== false;
            const images: Array<{
                url?: string;
                base64Data?: string;
                mimeType: string;
                filename?: string;
            }> = [];

            if (shouldUpload) {
                this.logger.log(`Uploading ${rawImages.length} image(s) to GCS...`);

                for (let i = 0; i < rawImages.length; i++) {
                    const raw = rawImages[i];
                    try {
                        const uploadResult = await this.gcsStorage.uploadGeneratedImage(
                            raw.base64Data,
                            {
                                model: modelId,
                                feature: 'image-generation',
                                generatedAt: new Date(),
                                prompt: request.prompt.substring(0, 500),
                                parameters: {
                                    aspectRatio: request.aspectRatio,
                                    negativePrompt: request.negativePrompt,
                                },
                            },
                            raw.mimeType,
                        );

                        images.push({
                            url: uploadResult.url,
                            filename: uploadResult.filename,
                            mimeType: raw.mimeType,
                        });

                        this.logger.log(`Image ${i + 1} uploaded: ${uploadResult.url}`);
                    } catch (uploadError) {
                        this.logger.error(`Failed to upload image ${i + 1}:`, uploadError);
                        // Fallback to base64 if upload fails
                        images.push({
                            base64Data: raw.base64Data,
                            mimeType: raw.mimeType,
                        });
                    }
                }
            } else {
                // Return base64 data without uploading
                for (const raw of rawImages) {
                    images.push({
                        base64Data: raw.base64Data,
                        mimeType: raw.mimeType,
                    });
                }
            }

            this.logger.log(`Successfully generated ${images.length} image(s)`);

            // Save to Supabase if userId provided and images have URLs
            if (request.userId) {
                for (const img of images) {
                    if (img.url) {
                        await this.mediaStorage.saveMedia({
                            userId: request.userId,
                            mediaType: 'image',
                            url: img.url,
                            filename: img.filename,
                            mimeType: img.mimeType,
                            model: modelId,
                            prompt: request.prompt,
                            negativePrompt: request.negativePrompt,
                            apiVersion: 'v2',
                            endpoint: 'image/generate',
                            metadata: {
                                aspectRatio: request.aspectRatio,
                            },
                        });
                    }
                }
            }

            return {
                images,
                prompt: request.prompt,
                model: modelId,
                generatedAt: new Date().toISOString(),
            };
        } catch (error) {
            this.logger.error('Image generation failed:', error);

            if (error instanceof HttpException) {
                throw error;
            }

            const message = error.message || 'Image generation failed';

            if (message.includes('safety') || message.includes('blocked')) {
                throw new HttpException(
                    'Image generation blocked due to safety filters. Please modify your prompt.',
                    HttpStatus.BAD_REQUEST,
                );
            }

            if (message.includes('quota') || message.includes('429')) {
                throw new HttpException(
                    'Rate limit exceeded. Please try again later.',
                    HttpStatus.TOO_MANY_REQUESTS,
                );
            }

            if (message.includes('not supported') || message.includes('image generation')) {
                throw new HttpException(
                    'Image generation not supported by this model. Try using gemini-2.0-flash-exp or Vertex AI Imagen.',
                    HttpStatus.BAD_REQUEST,
                );
            }

            throw new HttpException(
                `Image generation failed: ${message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Check if service is configured
     */
    isConfigured(): boolean {
        return !!this.genAI;
    }
}
