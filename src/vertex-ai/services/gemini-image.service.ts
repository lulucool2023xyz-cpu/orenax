import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GcsStorageService } from './gcs-storage.service';
import {
    GeminiImageGenerateDto,
    GeminiInterleavedGenerateDto,
    GeminiImageEditDto,
    GeminiMultiTurnEditDto,
    GeminiImageResponseDto,
    GeneratedImageDto,
    TextPartDto,
    ImagePartDto,
    ResponseModality,
} from '../dto/gemini-image.dto';

/**
 * Gemini Image Service
 * Handles image generation using Gemini models with native image output
 * 
 * Supported Models:
 * - gemini-2.5-flash-image: Fast image generation, 1024px max
 * - gemini-3-pro-image-preview: High quality, 4096px max, thinking support
 * 
 * Features:
 * - Text-to-image with text rendering
 * - Interleaved text + image generation
 * - Conversational image editing
 * - Multi-turn editing with thought signatures
 */
@Injectable()
export class GeminiImageService {
    private readonly logger = new Logger(GeminiImageService.name);
    private genAI: GoogleGenerativeAI;
    private readonly defaultModel = 'gemini-2.5-flash-image';

    constructor(
        private readonly configService: ConfigService,
        private readonly gcsStorage: GcsStorageService,
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.logger.log('Gemini Image Service initialized');
        } else {
            this.logger.warn('GEMINI_API_KEY not configured - Gemini Image generation disabled');
        }
    }

    /**
     * Generate image from text prompt
     * Supports text rendering and high-quality image generation
     */
    async generateImage(dto: GeminiImageGenerateDto): Promise<GeminiImageResponseDto> {
        if (!this.genAI) {
            throw new HttpException('Gemini API not configured', HttpStatus.SERVICE_UNAVAILABLE);
        }

        const modelId = dto.model || this.defaultModel;
        this.logger.log(`Generating image with ${modelId}: ${dto.prompt.substring(0, 50)}...`);

        try {
            const model = this.genAI.getGenerativeModel({
                model: modelId,
                generationConfig: {
                    temperature: dto.temperature ?? 1.0,
                    topP: dto.topP,
                    topK: dto.topK,
                    // @ts-ignore - responseModalities is valid for image models
                    responseModalities: dto.responseModalities || ['TEXT', 'IMAGE'],
                },
            });

            const result = await model.generateContent(dto.prompt);
            const response = result.response;

            // Extract images and text from response
            const images: GeneratedImageDto[] = [];
            let text = '';

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.text) {
                    text += part.text;
                }
                if (part.inlineData) {
                    const imageData: GeneratedImageDto = {
                        base64Data: part.inlineData.data,
                        mimeType: part.inlineData.mimeType || 'image/png',
                    };

                    // Upload to GCS
                    const uploaded = await this.uploadImageToGcs(
                        Buffer.from(part.inlineData.data, 'base64'),
                        dto.prompt,
                        modelId,
                    );
                    imageData.gcsUri = uploaded.gcsUri;
                    imageData.publicUrl = uploaded.publicUrl;

                    images.push(imageData);
                }
            }

            this.logger.log(`Generated ${images.length} image(s) with ${modelId}`);

            return {
                success: true,
                model: modelId,
                images,
                text: text || undefined,
                usageMetadata: response.usageMetadata ? {
                    promptTokenCount: response.usageMetadata.promptTokenCount || 0,
                    candidatesTokenCount: response.usageMetadata.candidatesTokenCount || 0,
                    totalTokenCount: response.usageMetadata.totalTokenCount || 0,
                } : undefined,
            };
        } catch (error: any) {
            this.logger.error(`Gemini image generation error: ${error.message}`);
            throw new HttpException(
                error.message || 'Image generation failed',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Generate interleaved text and images
     * Perfect for illustrated recipes, stories, tutorials
     */
    async generateInterleaved(dto: GeminiInterleavedGenerateDto): Promise<GeminiImageResponseDto> {
        if (!this.genAI) {
            throw new HttpException('Gemini API not configured', HttpStatus.SERVICE_UNAVAILABLE);
        }

        const modelId = dto.model || this.defaultModel;
        this.logger.log(`Generating interleaved content with ${modelId}`);

        try {
            const model = this.genAI.getGenerativeModel({
                model: modelId,
                generationConfig: {
                    temperature: dto.temperature ?? 1.0,
                    // @ts-ignore
                    responseModalities: ['TEXT', 'IMAGE'],
                },
            });

            const result = await model.generateContent(dto.prompt);
            const response = result.response;

            // Parse interleaved content
            const interleavedContent: (TextPartDto | ImagePartDto)[] = [];
            let imageIndex = 0;

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.text) {
                    interleavedContent.push({
                        type: 'text',
                        content: part.text,
                    });
                }
                if (part.inlineData) {
                    // Upload to GCS
                    const uploaded = await this.uploadImageToGcs(
                        Buffer.from(part.inlineData.data, 'base64'),
                        `${dto.prompt}-${imageIndex}`,
                        modelId,
                    );

                    interleavedContent.push({
                        type: 'image',
                        base64Data: part.inlineData.data,
                        mimeType: part.inlineData.mimeType || 'image/png',
                        gcsUri: uploaded.gcsUri,
                        publicUrl: uploaded.publicUrl,
                    });
                    imageIndex++;
                }
            }

            const imageCount = interleavedContent.filter(c => c.type === 'image').length;
            this.logger.log(`Generated interleaved content: ${interleavedContent.length} parts, ${imageCount} images`);

            return {
                success: true,
                model: modelId,
                interleavedContent,
                usageMetadata: response.usageMetadata ? {
                    promptTokenCount: response.usageMetadata.promptTokenCount || 0,
                    candidatesTokenCount: response.usageMetadata.candidatesTokenCount || 0,
                    totalTokenCount: response.usageMetadata.totalTokenCount || 0,
                } : undefined,
            };
        } catch (error: any) {
            this.logger.error(`Interleaved generation error: ${error.message}`);
            throw new HttpException(
                error.message || 'Interleaved generation failed',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Edit an image using conversational prompt
     * e.g., "Make it look like a cartoon"
     */
    async editImage(dto: GeminiImageEditDto): Promise<GeminiImageResponseDto> {
        if (!this.genAI) {
            throw new HttpException('Gemini API not configured', HttpStatus.SERVICE_UNAVAILABLE);
        }

        const modelId = dto.model || 'gemini-3-pro-image-preview';
        this.logger.log(`Editing image with ${modelId}: ${dto.prompt.substring(0, 50)}...`);

        try {
            // Prepare image data
            let imageData: string;
            let mimeType: string = dto.image.mimeType || 'image/png';

            if (dto.image.base64) {
                imageData = dto.image.base64;
            } else if (dto.image.gcsUri) {
                // Download from GCS
                const buffer = await this.gcsStorage.downloadFile(dto.image.gcsUri);
                imageData = buffer.toString('base64');
            } else {
                throw new HttpException('Image data required', HttpStatus.BAD_REQUEST);
            }

            const model = this.genAI.getGenerativeModel({
                model: modelId,
                generationConfig: {
                    // @ts-ignore
                    responseModalities: dto.responseModalities || ['TEXT', 'IMAGE'],
                },
            });

            // Send image with edit prompt
            const result = await model.generateContent([
                {
                    inlineData: {
                        mimeType,
                        data: imageData,
                    },
                },
                dto.prompt,
            ]);

            const response = result.response;
            const images: GeneratedImageDto[] = [];
            let text = '';
            let thoughtSignature: string | undefined;

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.text) {
                    text += part.text;
                }
                if (part.inlineData) {
                    const uploaded = await this.uploadImageToGcs(
                        Buffer.from(part.inlineData.data, 'base64'),
                        dto.prompt,
                        modelId,
                    );

                    images.push({
                        base64Data: part.inlineData.data,
                        mimeType: part.inlineData.mimeType || 'image/png',
                        gcsUri: uploaded.gcsUri,
                        publicUrl: uploaded.publicUrl,
                    });
                }
            }

            // Extract thought signature for Gemini 3 Pro Image
            // @ts-ignore - thought signature may be in candidate
            if (response.candidates?.[0]?.thoughtSignature) {
                // @ts-ignore
                thoughtSignature = response.candidates[0].thoughtSignature;
            }

            this.logger.log(`Edited image, generated ${images.length} result(s)`);

            return {
                success: true,
                model: modelId,
                images,
                text: text || undefined,
                thoughtSignature,
            };
        } catch (error: any) {
            this.logger.error(`Image edit error: ${error.message}`);
            throw new HttpException(
                error.message || 'Image editing failed',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Multi-turn image editing with context
     * Preserves reasoning context for iterative edits
     */
    async multiTurnEdit(dto: GeminiMultiTurnEditDto): Promise<GeminiImageResponseDto> {
        if (!this.genAI) {
            throw new HttpException('Gemini API not configured', HttpStatus.SERVICE_UNAVAILABLE);
        }

        const modelId = dto.model || 'gemini-3-pro-image-preview';
        this.logger.log(`Multi-turn edit with ${modelId}, conversation: ${dto.context.conversationId}`);

        try {
            const model = this.genAI.getGenerativeModel({
                model: modelId,
                generationConfig: {
                    // @ts-ignore
                    responseModalities: ['TEXT', 'IMAGE'],
                },
            });

            // Build content with previous context
            const contents: any[] = [];

            // Add previous images from context
            if (dto.context.previousImages && dto.context.previousImages.length > 0) {
                for (const img of dto.context.previousImages) {
                    if (img.base64) {
                        contents.push({
                            inlineData: {
                                mimeType: img.mimeType || 'image/png',
                                data: img.base64,
                            },
                        });
                    }
                }
            }

            // Add thought signature if available (for continuation)
            if (dto.context.thoughtSignature) {
                contents.push({
                    text: `[THOUGHT_SIGNATURE: ${dto.context.thoughtSignature}]`,
                });
            }

            // Add current prompt
            contents.push(dto.prompt);

            const result = await model.generateContent(contents);
            const response = result.response;

            const images: GeneratedImageDto[] = [];
            let text = '';
            let thoughtSignature: string | undefined;

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.text) {
                    text += part.text;
                }
                if (part.inlineData) {
                    const uploaded = await this.uploadImageToGcs(
                        Buffer.from(part.inlineData.data, 'base64'),
                        dto.prompt,
                        modelId,
                    );

                    images.push({
                        base64Data: part.inlineData.data,
                        mimeType: part.inlineData.mimeType || 'image/png',
                        gcsUri: uploaded.gcsUri,
                        publicUrl: uploaded.publicUrl,
                    });
                }
            }

            // @ts-ignore
            if (response.candidates?.[0]?.thoughtSignature) {
                // @ts-ignore
                thoughtSignature = response.candidates[0].thoughtSignature;
            }

            return {
                success: true,
                model: modelId,
                images,
                text: text || undefined,
                thoughtSignature,
            };
        } catch (error: any) {
            this.logger.error(`Multi-turn edit error: ${error.message}`);
            throw new HttpException(
                error.message || 'Multi-turn editing failed',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Upload generated image to GCS
     */
    private async uploadImageToGcs(
        imageBuffer: Buffer,
        prompt: string,
        model: string,
    ): Promise<{ gcsUri: string; publicUrl: string }> {
        try {
            const date = new Date();
            const datePath = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
            const filename = `gemini-image-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
            const path = `images/${datePath}/${filename}`;

            const result = await this.gcsStorage.uploadBuffer(imageBuffer, path, 'image/png');

            return {
                gcsUri: result.gcsUri,
                publicUrl: result.publicUrl,
            };
        } catch (error: any) {
            this.logger.error(`GCS upload error: ${error.message}`);
            // Return empty if upload fails - image still in base64
            return {
                gcsUri: '',
                publicUrl: '',
            };
        }
    }

    /**
     * Get supported models
     */
    getSupportedModels(): string[] {
        return [
            'gemini-2.5-flash-image',
            'gemini-3-pro-image-preview',
        ];
    }

    /**
     * Check if service is configured
     */
    isConfigured(): boolean {
        return !!this.genAI;
    }
}
