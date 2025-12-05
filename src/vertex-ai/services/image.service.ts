import { Injectable, Logger } from '@nestjs/common';
import { PredictionServiceClient, helpers } from '@google-cloud/aiplatform';
import { google } from '@google-cloud/aiplatform/build/protos/protos';
import * as path from 'path';
import { VertexAiConfigService } from '../config/vertex-ai.config';
import { GcsStorageService } from './gcs-storage.service';
import { MediaStorageService } from '../../supabase/media-storage.service';
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
 * Now with Supabase storage for authenticated users!
 */
@Injectable()
export class ImageService {
    private readonly logger = new Logger(ImageService.name);
    private client: PredictionServiceClient;

    constructor(
        private readonly config: VertexAiConfigService,
        private readonly gcsStorage: GcsStorageService,
        private readonly mediaStorage: MediaStorageService,
    ) {
        this.initializeClient();
    }

    /**
     * Initialize Prediction Service Client
     */
    /**
     * Initialize Prediction Service Client
     */
    private initializeClient(): void {
        try {
            const clientOptions: any = {
                apiEndpoint: `${this.config.getLocation()}-${this.config.getApiEndpoint()}`,
            };

            // If GOOGLE_APPLICATION_CREDENTIALS is set, the client will use it automatically.
            // Only load manually if we need to support a custom path from config that isn't in env.
            const envCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            const configCredentialsPath = this.config.getCredentialsPath();

            if (!envCredentialsPath && configCredentialsPath) {
                const absolutePath = path.isAbsolute(configCredentialsPath)
                    ? configCredentialsPath
                    : path.resolve(process.cwd(), configCredentialsPath);

                this.logger.log(`Loading credentials from config: ${absolutePath}`);
                try {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const credentials = require(absolutePath);
                    clientOptions.credentials = credentials;
                } catch (e) {
                    this.logger.warn(`Could not load credentials from ${absolutePath}: ${e.message}`);
                    // Don't throw here, let the client try default auth methods
                }
            }

            this.client = new PredictionServiceClient(clientOptions);

            this.logger.log('Vertex AI Image Client initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize Image Client:', error);
            throw error;
        }
    }

    /**
     * Text-to-Image Generation
     * Generate images from text prompts using Imagen or Gemini models
     * Saves to Supabase if userId is provided
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

            // Save to Supabase if userId provided (authenticated user)
            if (dto.userId) {
                for (const img of uploadedImages) {
                    if (img.url) {
                        await this.mediaStorage.saveMedia({
                            userId: dto.userId,
                            mediaType: 'image',
                            url: img.url,
                            gcsUri: img.gcsUri,
                            filename: img.filename,
                            mimeType: img.mimeType || 'image/png',
                            model: model,
                            prompt: dto.prompt,
                            negativePrompt: dto.negativePrompt,
                            apiVersion: 'v1',
                            endpoint: 'text-to-image',
                            metadata: {
                                aspectRatio: dto.aspectRatio,
                                sampleCount: dto.sampleCount,
                                enhancePrompt: dto.enhancePrompt,
                            },
                        });
                        this.logger.log(`Saved image to Supabase for user ${dto.userId}`);
                    }
                }
            }

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
     * Per Vertex AI docs: instances and parameters must be protobuf Value objects
     */
    private async generateWithImagen(endpoint: string, dto: TextToImageDto): Promise<any> {
        // Build instance - plain prompt object per API docs
        const instance: Record<string, any> = {
            prompt: dto.prompt,
        };

        // Build parameters per official Imagen API documentation
        const parameters: Record<string, any> = {
            sampleCount: dto.sampleCount || 1,
        };

        // Optional parameters per API docs
        if (dto.negativePrompt) {
            parameters.negativePrompt = dto.negativePrompt;
        }

        if (dto.aspectRatio) {
            parameters.aspectRatio = dto.aspectRatio;
        }

        if (dto.enhancePrompt !== undefined) {
            parameters.enhancePrompt = dto.enhancePrompt;
        }

        if (dto.addWatermark !== undefined) {
            parameters.addWatermark = dto.addWatermark;
        } else {
            parameters.addWatermark = true; // Default per API docs
        }

        if (dto.seed !== undefined) {
            parameters.seed = dto.seed;
        }

        if (dto.personGeneration) {
            parameters.personGeneration = dto.personGeneration;
        }

        if (dto.safetySetting) {
            parameters.safetySetting = dto.safetySetting;
        }

        if (dto.language) {
            parameters.language = dto.language;
        }

        if (dto.sampleImageSize) {
            parameters.sampleImageSize = dto.sampleImageSize;
        }

        if (dto.outputOptions) {
            parameters.outputOptions = dto.outputOptions;
        }

        if (dto.storageUri) {
            parameters.storageUri = dto.storageUri;
        }

        // Convert to protobuf Value format as required by Vertex AI SDK
        const request: IPredictRequest = {
            endpoint,
            instances: [helpers.toValue(instance) as any],
            parameters: helpers.toValue(parameters) as any,
        };

        this.logger.debug(`Imagen Request to: ${endpoint}`);
        this.logger.debug(`Instance: ${JSON.stringify(instance)}`);
        this.logger.debug(`Parameters: ${JSON.stringify(parameters)}`);

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
     * Predictions come as protobuf Value objects, need to convert them
     */
    private extractImagesFromResponse(response: any, isGemini: boolean): Array<{ base64Data: string; mimeType: string }> {
        this.logger.debug(`Raw response: ${JSON.stringify(response, null, 2)}`);

        if (!response.predictions || response.predictions.length === 0) {
            throw new Error('No images generated');
        }

        return response.predictions.map((prediction: any) => {
            // Convert protobuf Value to JavaScript object if needed
            let predictionObj = prediction;

            // Check if it's a protobuf Value object (has structValue or fields)
            if (prediction.structValue || prediction.fields) {
                predictionObj = helpers.fromValue(prediction);
            }

            this.logger.debug(`Prediction object: ${JSON.stringify(predictionObj)}`);

            // Handle different response structures
            const base64Data = predictionObj.bytesBase64Encoded ||
                predictionObj.bytes_base64_encoded ||
                (predictionObj.image && predictionObj.image.bytesBase64Encoded);

            if (!base64Data) {
                this.logger.error(`Prediction structure: ${JSON.stringify(predictionObj)}`);
                throw new Error('Image data missing from response');
            }

            return {
                base64Data: base64Data,
                mimeType: predictionObj.mimeType || predictionObj.mime_type || 'image/png',
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
