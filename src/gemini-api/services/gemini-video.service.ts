import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GcsStorageService } from '../../vertex-ai/services/gcs-storage.service';
import {
    GeminiVideoGenerationDto,
    ImageToVideoDto,
    VideoExtendDto,
    FrameInterpolationDto,
    VideoWithReferencesDto,
    VideoGenerationResponse,
    VideoOperationStatus,
    VEO_MODELS,
} from '../dto/gemini-video.dto';

/**
 * Veo Video Generation Service
 * Complete implementation with advanced features:
 * - Text-to-Video
 * - Image-to-Video
 * - Video Extension
 * - First-Last Frame Interpolation
 * - Reference Images (Style/Asset)
 * 
 * All outputs saved to GCS
 */
@Injectable()
export class GeminiVideoService {
    private readonly logger = new Logger(GeminiVideoService.name);
    private readonly apiKey: string;
    private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    private readonly defaultModel = 'veo-3.1-generate-preview';

    constructor(
        private readonly configService: ConfigService,
        private readonly gcsStorage: GcsStorageService,
    ) {
        this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
        if (!this.apiKey) {
            this.logger.warn('GEMINI_API_KEY not configured - video generation will not work');
        } else {
            this.logger.log('Veo Video Service initialized with all advanced features');
        }
    }

    /**
     * Generate video from text prompt
     */
    async generateVideo(dto: GeminiVideoGenerationDto): Promise<VideoGenerationResponse> {
        if (!this.apiKey) {
            throw new HttpException(
                'Video generation service not configured. Missing GEMINI_API_KEY.',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        const model = dto.model || this.defaultModel;
        this.logger.log(`Text-to-Video generation with model: ${model}`);

        try {
            const requestBody = this.buildTextToVideoRequest(dto);
            const operationName = await this.startOperation(model, requestBody);
            return await this.completeOperation(operationName, dto.prompt, model, dto);
        } catch (error) {
            this.handleError(error, 'Text-to-Video generation');
        }
    }

    /**
     * Generate video from image (Image-to-Video)
     */
    async imageToVideo(dto: ImageToVideoDto): Promise<VideoGenerationResponse> {
        if (!this.apiKey) {
            throw new HttpException(
                'Video generation service not configured.',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        const model = dto.model || this.defaultModel;
        this.logger.log(`Image-to-Video generation with model: ${model}`);

        try {
            const requestBody = await this.buildImageToVideoRequest(dto);
            const operationName = await this.startOperation(model, requestBody);
            return await this.completeOperation(operationName, dto.prompt, model, dto);
        } catch (error) {
            this.handleError(error, 'Image-to-Video generation');
        }
    }

    /**
     * Extend an existing video
     */
    async extendVideo(dto: VideoExtendDto): Promise<VideoGenerationResponse> {
        if (!this.apiKey) {
            throw new HttpException(
                'Video generation service not configured.',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        const model = dto.model || this.defaultModel;
        this.logger.log(`Video extension with model: ${model}`);

        try {
            const requestBody = await this.buildVideoExtendRequest(dto);
            const operationName = await this.startOperation(model, requestBody);
            return await this.completeOperation(operationName, dto.prompt, model, {
                durationSeconds: dto.extensionSeconds,
            });
        } catch (error) {
            this.handleError(error, 'Video extension');
        }
    }

    /**
     * Generate video between first and last frame (interpolation)
     */
    async interpolateFrames(dto: FrameInterpolationDto): Promise<VideoGenerationResponse> {
        if (!this.apiKey) {
            throw new HttpException(
                'Video generation service not configured.',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        const model = dto.model || this.defaultModel;
        this.logger.log(`Frame interpolation with model: ${model}`);

        try {
            const requestBody = await this.buildFrameInterpolationRequest(dto);
            const operationName = await this.startOperation(model, requestBody);
            return await this.completeOperation(operationName, dto.prompt, model, dto);
        } catch (error) {
            this.handleError(error, 'Frame interpolation');
        }
    }

    /**
     * Generate video with reference images (style or asset)
     */
    async generateWithReferences(dto: VideoWithReferencesDto): Promise<VideoGenerationResponse> {
        if (!this.apiKey) {
            throw new HttpException(
                'Video generation service not configured.',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        const model = dto.model || this.defaultModel;
        this.logger.log(`Video with references, model: ${model}, references: ${dto.referenceImages.length}`);

        try {
            const requestBody = await this.buildVideoWithReferencesRequest(dto);
            const operationName = await this.startOperation(model, requestBody);
            return await this.completeOperation(operationName, dto.prompt, model, dto);
        } catch (error) {
            this.handleError(error, 'Video with references');
        }
    }

    /**
     * Get operation status (for async tracking)
     */
    async getOperationStatus(operationId: string): Promise<VideoOperationStatus> {
        const url = `${this.baseUrl}/${operationId}`;

        const response = await fetch(url, {
            headers: { 'x-goog-api-key': this.apiKey },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new HttpException(
                error.error?.message || 'Failed to get operation status',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        const data = await response.json();

        if (data.done === true) {
            const videoUri = data.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;

            if (videoUri) {
                // Download and upload to GCS
                const videoBuffer = await this.downloadVideo(videoUri);
                const uploadResult = await this.uploadToGcs(videoBuffer, 'async-video', 'async-operation');

                return {
                    operationId,
                    status: 'COMPLETED',
                    progress: 100,
                    result: {
                        success: true,
                        url: uploadResult.publicUrl,
                        gcsUri: uploadResult.gcsUri,
                        filename: uploadResult.filename,
                        prompt: '',
                        model: '',
                        duration: 0,
                        resolution: '',
                        aspectRatio: '',
                        generatedAt: new Date().toISOString(),
                    },
                };
            }

            if (data.error) {
                return {
                    operationId,
                    status: 'FAILED',
                    error: data.error.message,
                };
            }
        }

        return {
            operationId,
            status: 'RUNNING',
            progress: data.metadata?.progress || 50,
        };
    }

    // ==================== Request Builders ====================

    private buildTextToVideoRequest(dto: GeminiVideoGenerationDto): any {
        const request: any = {
            instances: [{ prompt: dto.prompt }],
            parameters: {},
        };

        if (dto.negativePrompt) request.parameters.negativePrompt = dto.negativePrompt;
        if (dto.aspectRatio) request.parameters.aspectRatio = dto.aspectRatio;
        if (dto.durationSeconds) request.parameters.durationSeconds = dto.durationSeconds;
        if (dto.resolution) request.parameters.resolution = dto.resolution;
        if (dto.generateAudio) request.parameters.generateAudio = dto.generateAudio;
        if (dto.seed !== undefined) request.parameters.seed = dto.seed;
        if (dto.compressionQuality) request.parameters.compressionQuality = dto.compressionQuality;

        return request;
    }

    private async buildImageToVideoRequest(dto: ImageToVideoDto): Promise<any> {
        const imageData = await this.prepareImageData(dto.image);

        const request: any = {
            instances: [{
                prompt: dto.prompt,
                image: imageData,
            }],
            parameters: {},
        };

        if (dto.negativePrompt) request.parameters.negativePrompt = dto.negativePrompt;
        if (dto.aspectRatio) request.parameters.aspectRatio = dto.aspectRatio;
        if (dto.durationSeconds) request.parameters.durationSeconds = dto.durationSeconds;
        if (dto.resizeMode) request.parameters.resizeMode = dto.resizeMode;
        if (dto.generateAudio) request.parameters.generateAudio = dto.generateAudio;

        return request;
    }

    private async buildVideoExtendRequest(dto: VideoExtendDto): Promise<any> {
        let videoData: any;

        if (dto.video.gcsUri) {
            videoData = { gcsUri: dto.video.gcsUri };
        } else if (dto.video.bytesBase64Encoded) {
            videoData = {
                bytesBase64Encoded: dto.video.bytesBase64Encoded,
                mimeType: dto.video.mimeType || 'video/mp4',
            };
        }

        const request: any = {
            instances: [{
                prompt: dto.prompt,
                video: videoData,
            }],
            parameters: {},
        };

        if (dto.extensionSeconds) request.parameters.durationSeconds = dto.extensionSeconds;
        if (dto.generateAudio) request.parameters.generateAudio = dto.generateAudio;

        return request;
    }

    private async buildFrameInterpolationRequest(dto: FrameInterpolationDto): Promise<any> {
        const firstFrameData = await this.prepareImageData(dto.firstFrame);
        const lastFrameData = await this.prepareImageData(dto.lastFrame);

        const request: any = {
            instances: [{
                prompt: dto.prompt,
                image: firstFrameData,
                lastFrame: lastFrameData,
            }],
            parameters: {},
        };

        if (dto.aspectRatio) request.parameters.aspectRatio = dto.aspectRatio;
        if (dto.durationSeconds) request.parameters.durationSeconds = dto.durationSeconds;
        if (dto.generateAudio) request.parameters.generateAudio = dto.generateAudio;

        return request;
    }

    private async buildVideoWithReferencesRequest(dto: VideoWithReferencesDto): Promise<any> {
        const referenceImages: any[] = [];

        for (const ref of dto.referenceImages) {
            const imageData = await this.prepareImageData(ref.image);
            referenceImages.push({
                image: imageData,
                referenceType: ref.referenceType,
            });
        }

        const instance: any = {
            prompt: dto.prompt,
            referenceImages,
        };

        if (dto.image) {
            instance.image = await this.prepareImageData(dto.image);
        }

        const request: any = {
            instances: [instance],
            parameters: {},
        };

        if (dto.aspectRatio) request.parameters.aspectRatio = dto.aspectRatio;
        if (dto.durationSeconds) request.parameters.durationSeconds = dto.durationSeconds;
        if (dto.generateAudio) request.parameters.generateAudio = dto.generateAudio;

        return request;
    }

    // ==================== Helper Methods ====================

    private async prepareImageData(image: { bytesBase64Encoded?: string; gcsUri?: string; mimeType?: string }): Promise<any> {
        if (image.gcsUri) {
            return { gcsUri: image.gcsUri };
        }
        if (image.bytesBase64Encoded) {
            return {
                bytesBase64Encoded: image.bytesBase64Encoded,
                mimeType: image.mimeType || 'image/png',
            };
        }
        throw new HttpException('Image data required', HttpStatus.BAD_REQUEST);
    }

    private async startOperation(model: string, requestBody: any): Promise<string> {
        const url = `${this.baseUrl}/models/${model}:predictLongRunning`;

        this.logger.debug(`Starting operation at: ${url}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': this.apiKey,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to start generation');
        }

        const data = await response.json();
        this.logger.log(`Operation started: ${data.name}`);
        return data.name;
    }

    private async pollOperation(operationName: string): Promise<string> {
        const url = `${this.baseUrl}/${operationName}`;
        const maxAttempts = 120; // 20 minutes max
        const pollInterval = 10000; // 10 seconds

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            this.logger.debug(`Polling attempt ${attempt + 1}/${maxAttempts}`);

            const response = await fetch(url, {
                headers: { 'x-goog-api-key': this.apiKey },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Failed to check status');
            }

            const data = await response.json();

            if (data.done === true) {
                const videoUri = data.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;

                if (!videoUri) {
                    if (data.error) {
                        throw new Error(data.error.message);
                    }
                    throw new Error('No video URI in response');
                }

                this.logger.log('Generation completed');
                return videoUri;
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        throw new Error('Generation timed out after 20 minutes');
    }

    private async downloadVideo(videoUri: string): Promise<Buffer> {
        this.logger.debug(`Downloading video from: ${videoUri}`);

        const response = await fetch(videoUri, {
            headers: { 'x-goog-api-key': this.apiKey },
            redirect: 'follow',
        });

        if (!response.ok) {
            throw new Error('Failed to download video');
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    private async uploadToGcs(
        videoBuffer: Buffer,
        prompt: string,
        model: string,
    ): Promise<{ publicUrl: string; gcsUri: string; filename: string }> {
        const date = new Date();
        const datePath = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
        const filename = `veo-video-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`;
        const path = `videos/${datePath}/${filename}`;

        const base64Data = videoBuffer.toString('base64');

        const result = await this.gcsStorage.uploadGeneratedImage(
            base64Data,
            {
                model,
                feature: 'video-generation',
                generatedAt: date,
                prompt,
            },
            'video/mp4',
        );

        this.logger.log(`Video uploaded to GCS: ${result.url}`);

        return {
            publicUrl: result.url,
            gcsUri: result.gcsUri || `gs://${this.configService.get('GCS_BUCKET_NAME')}/${path}`,
            filename,
        };
    }

    private async completeOperation(
        operationName: string,
        prompt: string,
        model: string,
        options: any,
    ): Promise<VideoGenerationResponse> {
        const videoUri = await this.pollOperation(operationName);
        const videoBuffer = await this.downloadVideo(videoUri);
        const uploadResult = await this.uploadToGcs(videoBuffer, prompt, model);

        return {
            success: true,
            url: uploadResult.publicUrl,
            gcsUri: uploadResult.gcsUri,
            filename: uploadResult.filename,
            prompt,
            model,
            duration: options.durationSeconds || 8,
            resolution: options.resolution || '720p',
            aspectRatio: options.aspectRatio || '16:9',
            hasAudio: options.generateAudio || false,
            generatedAt: new Date().toISOString(),
            operationId: operationName,
        };
    }

    private handleError(error: any, operation: string): never {
        this.logger.error(`${operation} failed:`, error);

        if (error instanceof HttpException) {
            throw error;
        }

        const message = error.message || `${operation} failed`;

        if (message.includes('safety') || message.includes('blocked')) {
            throw new HttpException(
                'Generation blocked by safety filters. Modify your prompt.',
                HttpStatus.BAD_REQUEST,
            );
        }

        if (message.includes('quota') || message.includes('429')) {
            throw new HttpException(
                'Rate limit exceeded. Try again later.',
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        throw new HttpException(
            `${operation} failed: ${message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    // ==================== Utility Methods ====================

    isConfigured(): boolean {
        return !!this.apiKey;
    }

    getSupportedModels(): string[] {
        return [...VEO_MODELS];
    }
}
