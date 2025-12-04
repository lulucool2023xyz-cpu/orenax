import { Injectable, Logger } from '@nestjs/common';
import { PredictionServiceClient } from '@google-cloud/aiplatform';
import { google } from '@google-cloud/aiplatform/build/protos/protos';
import * as path from 'path';
import { VertexAiConfigService } from '../config/vertex-ai.config';
import { GcsStorageService } from './gcs-storage.service';
import { ImageErrorHandler } from '../utils/image-error-handler.util';
import {
    TextToImageDto,
    ImageUpscaleDto,
    ImageEditDto,
    ImageCustomizeDto,
    VirtualTryOnDto,
    ProductRecontextDto,
} from '../dto/image-request.dto';
import { ImageGenerationResponseDto } from '../dto/image-response.dto';

type IGenerateContentRequest = google.cloud.aiplatform.v1.IGenerateContentRequest;
type IPredictRequest = google.cloud.aiplatform.v1.IPredictRequest;

/**
 * Image Service for Vertex AI Imagen
 * Handles all image generation, editing, and manipulation operations
 */
@Injectable()
export class ImageService {
    private readonly logger = new Logger(ImageService.name);
    private client: PredictionServiceClient;

    constructor(
        private readonly config: VertexAiConfigService,
        private readonly gcsStorage: GcsStorageService,
    ) {
        this.initializeClient();
    }

    /**
     * Initialize Prediction Service Client
     */
    private initializeClient(): void {
        try {
            const credentialsPath = this.config.getCredentialsPath();
            const absolutePath = path.isAbsolute(credentialsPath)
                ? credentialsPath
                : path.resolve(process.cwd(), credentialsPath);

            this.logger.log(`Loading credentials from: ${absolutePath}`);
            const credentials = require(absolutePath);

            this.client = new PredictionServiceClient({
                apiEndpoint: `${this.config.getLocation()}-${this.config.getApiEndpoint()}`,
                credentials,
            });

            this.logger.log('Vertex AI Image Client initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize Image Client:', error);
            throw error;
        }
    }

    /**
     * Text-to-Image Generation
     * Generate images from text prompts using Imagen or Gemini models
     */
    async textToImage(dto: TextToImageDto): Promise<ImageGenerationResponseDto> {
        try {
            const model = dto.model || 'imagen-3.0-generate-001';
            const endpoint = this.getModelEndpoint(model);

            ImageErrorHandler.logGenerationAttempt('text-to-image', model, {
                prompt: dto.prompt,
                sampleCount: dto.sampleCount || 1,
            });

            // Build request based on model type
            const isGeminiModel = model.includes('gemini');

            let response: any;

            if (isGeminiModel) {
                // Gemini models use different API format
                response = await this.generateWithGemini(endpoint, dto);
            } else {
                // Imagen models use predict API
                response = await this.generateWithImagen(endpoint, dto);
            }

            // Extract images from response
            const images = this.extractImagesFromResponse(response, isGeminiModel);

            // Upload images to GCS
            const uploadedImages = await this.gcsStorage.uploadMultipleImages(
                images,
                {
                    model,
                    feature: 'text-to-image',
                    generatedAt: new Date(),
                    prompt: dto.prompt,
                    parameters: dto,
                },
            );

            ImageErrorHandler.logGenerationSuccess('text-to-image', uploadedImages.length);

            return {
                success: true,
                model,
                images: uploadedImages,
            };
        } catch (error) {
            ImageErrorHandler.handleVertexAiError(error);
        }
    }

    /**
     * Generate with Imagen models (imagen-3.0, imagen-4.0)
     */
    private async generateWithImagen(endpoint: string, dto: TextToImageDto): Promise<any> {
        // Build parameters object according to Vertex AI Imagen API spec
        const parameters: any = {
            sampleCount: dto.sampleCount || 1,
            addWatermark: dto.addWatermark ?? true,
        };

        // Add optional parameters
        if (dto.seed !== undefined) parameters.seed = dto.seed;
        if (dto.negativePrompt) parameters.negativePrompt = dto.negativePrompt;

        // Note: 'language' is NOT a supported parameter in Vertex AI Imagen API
        // It will be ignored to prevent INVALID_ARGUMENT errors

        if (dto.outputOptions) {
            parameters.outputOptions = {
                ...(dto.outputOptions.mimeType && { mimeType: dto.outputOptions.mimeType }),
                ...(dto.outputOptions.compressionQuality !== undefined && {
                    compressionQuality: dto.outputOptions.compressionQuality
                }),
            };
        }

        if (dto.storageUri) parameters.storageUri = dto.storageUri;
        if (dto.safetySetting) parameters.safetySetting = dto.safetySetting;
        if (dto.personGeneration) parameters.personGeneration = dto.personGeneration;

        const request: any = {
            endpoint,
            instances: [
                {
                    prompt: dto.prompt,
                },
            ],
            parameters,
        };

        this.logger.debug(`Vertex AI Request: ${JSON.stringify(request, null, 2)}`);

        const [response] = await this.client.predict(request);
        return response;
    }

    /**
     * Generate with Gemini Image models
     */
    private async generateWithGemini(endpoint: string, dto: TextToImageDto): Promise<any> {
        // Gemini uses generateContent API with responseModalities
        // This will be implemented when we have the proper SDK support
        throw new Error('Gemini Image models support coming soon');
    }

    /**
     * Extract images from Vertex AI response
     */
    private extractImagesFromResponse(response: any, isGemini: boolean): Array<{ base64Data: string; mimeType: string }> {
        if (!response.predictions || response.predictions.length === 0) {
            throw new Error('No images generated');
        }

        return response.predictions.map((prediction: any) => {
            if (!prediction.bytesBase64Encoded) {
                throw new Error('Image data missing from response');
            }

            return {
                base64Data: prediction.bytesBase64Encoded,
                mimeType: prediction.mimeType || 'image/png',
            };
        });
    }

    /**
     * Get model endpoint path
     */
    private getModelEndpoint(modelId: string): string {
        const projectId = process.env.GOOGLE_CLOUD_PROJECT;
        const location = this.config.getLocation();

        return `projects/${projectId}/locations/${location}/publishers/google/models/${modelId}`;
    }

    /**
     * Image Upscale
     * Upscale images to higher resolutions
     */
    async upscaleImage(dto: ImageUpscaleDto): Promise<ImageGenerationResponseDto> {
        try {
            const model = 'imagen-4.0-upscale-preview';
            const endpoint = this.getModelEndpoint(model);

            ImageErrorHandler.logGenerationAttempt('upscale', model, {
                upscaleFactor: dto.upscaleFactor || 'x2',
            });

            const request: any = {
                endpoint,
                instances: [
                    {
                        prompt: dto.prompt || 'Upscale the image',
                        image: {
                            bytesBase64Encoded: dto.image,
                        },
                    },
                ],
                parameters: {
                    mode: 'upscale',
                    upscaleConfig: {
                        upscaleFactor: dto.upscaleFactor || 'x2',
                    },
                    addWatermark: dto.addWatermark ?? true,
                    ...(dto.outputOptions && { outputOptions: dto.outputOptions }),
                    ...(dto.storageUri && { storageUri: dto.storageUri }),
                },
            };

            const [response] = await this.client.predict(request);
            const images = this.extractImagesFromResponse(response, false);

            const uploadedImages = await this.gcsStorage.uploadMultipleImages(
                images,
                {
                    model,
                    feature: 'upscale',
                    generatedAt: new Date(),
                    parameters: dto,
                },
            );

            ImageErrorHandler.logGenerationSuccess('upscale', uploadedImages.length);

            return {
                success: true,
                model,
                images: uploadedImages,
            };
        } catch (error) {
            ImageErrorHandler.handleVertexAiError(error);
        }
    }

    /**
     * Image Edit (Mask-based)
     * Edit images using masks and prompts
     */
    async editImage(dto: ImageEditDto): Promise<ImageGenerationResponseDto> {
        try {
            const model = 'imagen-3.0-capability-001';
            const endpoint = this.getModelEndpoint(model);

            ImageErrorHandler.logGenerationAttempt('edit', model, {
                editMode: dto.editMode,
                referenceImageCount: dto.referenceImages.length,
            });

            const request: any = {
                endpoint,
                instances: [
                    {
                        prompt: dto.prompt,
                        referenceImages: dto.referenceImages.map((ref) => ({
                            referenceType: ref.referenceType,
                            referenceId: ref.referenceId,
                            referenceImage: {
                                bytesBase64Encoded: ref.bytesBase64Encoded,
                            },
                            ...(ref.maskImageConfig && { maskImageConfig: ref.maskImageConfig }),
                        })),
                    },
                ],
                parameters: {
                    editMode: dto.editMode,
                    ...(dto.baseSteps && { baseSteps: dto.baseSteps }),
                    ...(dto.guidanceScale && { guidanceScale: dto.guidanceScale }),
                    sampleCount: dto.sampleCount || 4,
                    addWatermark: dto.addWatermark ?? true,
                },
            };

            const [response] = await this.client.predict(request);
            const images = this.extractImagesFromResponse(response, false);

            const uploadedImages = await this.gcsStorage.uploadMultipleImages(
                images,
                {
                    model,
                    feature: 'edit',
                    generatedAt: new Date(),
                    prompt: dto.prompt,
                    parameters: dto,
                },
            );

            ImageErrorHandler.logGenerationSuccess('edit', uploadedImages.length);

            return {
                success: true,
                model,
                images: uploadedImages,
            };
        } catch (error) {
            ImageErrorHandler.handleVertexAiError(error);
        }
    }

    /**
     * Image Customize
     * Customize images using reference images
     */
    async customizeImage(dto: ImageCustomizeDto): Promise<ImageGenerationResponseDto> {
        try {
            const model = 'imagen-3.0-capability-001';
            const endpoint = this.getModelEndpoint(model);

            ImageErrorHandler.logGenerationAttempt('customize', model, {
                referenceImageCount: dto.referenceImages.length,
            });

            const request: any = {
                endpoint,
                instances: [
                    {
                        prompt: dto.prompt,
                        referenceImages: dto.referenceImages.map((ref) => ({
                            referenceType: ref.referenceType,
                            referenceId: ref.referenceId,
                            referenceImage: {
                                bytesBase64Encoded: ref.bytesBase64Encoded,
                            },
                            ...(ref.controlImageConfig && { controlImageConfig: ref.controlImageConfig }),
                            ...(ref.subjectImageConfig && { subjectImageConfig: ref.subjectImageConfig }),
                        })),
                    },
                ],
                parameters: {
                    sampleCount: dto.sampleCount || 4,
                    ...(dto.negativePrompt && { negativePrompt: dto.negativePrompt }),
                    ...(dto.seed && { seed: dto.seed }),
                },
            };

            const [response] = await this.client.predict(request);
            const images = this.extractImagesFromResponse(response, false);

            const uploadedImages = await this.gcsStorage.uploadMultipleImages(
                images,
                {
                    model,
                    feature: 'customize',
                    generatedAt: new Date(),
                    prompt: dto.prompt,
                    parameters: dto,
                },
            );

            ImageErrorHandler.logGenerationSuccess('customize', uploadedImages.length);

            return {
                success: true,
                model,
                images: uploadedImages,
            };
        } catch (error) {
            ImageErrorHandler.handleVertexAiError(error);
        }
    }

    /**
     * Virtual Try-On
     * Virtual try-on for clothing products
     */
    async virtualTryOn(dto: VirtualTryOnDto): Promise<ImageGenerationResponseDto> {
        try {
            const model = 'virtual-try-on-preview-08-04';
            const endpoint = this.getModelEndpoint(model);

            ImageErrorHandler.logGenerationAttempt('virtual-try-on', model, {
                productImageCount: dto.productImages.length,
            });

            const request: any = {
                endpoint,
                instances: [
                    {
                        personImage: {
                            image: {
                                bytesBase64Encoded: dto.personImage,
                            },
                        },
                        productImages: dto.productImages.map((img) => ({
                            image: {
                                bytesBase64Encoded: img,
                            },
                        })),
                    },
                ],
                parameters: {
                    sampleCount: dto.sampleCount || 1,
                    baseSteps: dto.baseSteps || 32,
                    addWatermark: dto.addWatermark ?? true,
                    ...(dto.outputOptions && { outputOptions: dto.outputOptions }),
                    ...(dto.storageUri && { storageUri: dto.storageUri }),
                },
            };

            const [response] = await this.client.predict(request);
            const images = this.extractImagesFromResponse(response, false);

            const uploadedImages = await this.gcsStorage.uploadMultipleImages(
                images,
                {
                    model,
                    feature: 'virtual-try-on',
                    generatedAt: new Date(),
                    parameters: dto,
                },
            );

            ImageErrorHandler.logGenerationSuccess('virtual-try-on', uploadedImages.length);

            return {
                success: true,
                model,
                images: uploadedImages,
            };
        } catch (error) {
            ImageErrorHandler.handleVertexAiError(error);
        }
    }

    /**
     * Product Recontextualization
     * Recontextualize product images into different scenes
     */
    async productRecontext(dto: ProductRecontextDto): Promise<ImageGenerationResponseDto> {
        try {
            const model = 'imagen-product-recontext-preview-06-30';
            const endpoint = this.getModelEndpoint(model);

            ImageErrorHandler.logGenerationAttempt('product-recontext', model, {
                productImageCount: dto.productImages.length,
                enhancePrompt: dto.enhancePrompt,
            });

            const request: any = {
                endpoint,
                instances: [
                    {
                        ...(dto.prompt && { prompt: dto.prompt }),
                        productImages: dto.productImages.map((img) => ({
                            image: {
                                bytesBase64Encoded: img,
                            },
                        })),
                    },
                ],
                parameters: {
                    sampleCount: dto.sampleCount || 1,
                    addWatermark: dto.addWatermark ?? true,
                    enhancePrompt: dto.enhancePrompt ?? true,
                    ...(dto.safetySetting && { safetySetting: dto.safetySetting }),
                    ...(dto.personGeneration && { personGeneration: dto.personGeneration }),
                },
            };

            const [response] = await this.client.predict(request);
            const images = this.extractImagesFromResponse(response, false);

            const uploadedImages = await this.gcsStorage.uploadMultipleImages(
                images,
                {
                    model,
                    feature: 'product-recontext',
                    generatedAt: new Date(),
                    prompt: dto.prompt,
                    parameters: dto,
                },
            );

            ImageErrorHandler.logGenerationSuccess('product-recontext', uploadedImages.length);

            return {
                success: true,
                model,
                images: uploadedImages,
            };
        } catch (error) {
            ImageErrorHandler.handleVertexAiError(error);
        }
    }
}
