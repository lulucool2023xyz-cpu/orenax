import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GcsStorageService } from './gcs-storage.service';
import { MediaStorageService } from '../../supabase/media-storage.service';
import {
    TextToVideoDto,
    ImageToVideoDto,
    VideoExtendDto,
    FrameInterpolationDto,
    VideoWithReferencesDto,
    VideoGenerationResponse,
    VideoOperationStatus,
    VEO_MODELS,
} from '../dto/video-request.dto';

/**
 * Vertex AI Video Service
 * Veo video generation using Vertex AI SDK for API v1
 * 
 * Features:
 * - Text-to-Video
 * - Image-to-Video
 * - Video Extension
 * - First-Last Frame Interpolation
 * - Reference Images (Style/Asset)
 * 
 * All outputs saved to GCS with gcsUri
 * Now with Supabase storage for authenticated users!
 */
@Injectable()
export class VideoService {
    private readonly logger = new Logger(VideoService.name);
    private readonly projectId: string;
    private readonly location: string;
    private readonly defaultModel = 'veo-3.1-generate-preview';

    constructor(
        private readonly configService: ConfigService,
        private readonly gcsStorage: GcsStorageService,
        private readonly mediaStorage: MediaStorageService,
    ) {
        this.projectId = this.configService.get<string>('GOOGLE_CLOUD_PROJECT') || '';
        this.location = this.configService.get<string>('VERTEX_AI_LOCATION') || 'us-central1';

        if (this.projectId) {
            this.logger.log(`Vertex AI Video Service initialized: project=${this.projectId}, location=${this.location}`);
        } else {
            this.logger.warn('GOOGLE_CLOUD_PROJECT not configured - video generation disabled');
        }
    }

    /**
     * Generate video from text prompt
     * Saves to Supabase if userId is provided
     */
    async textToVideo(dto: TextToVideoDto): Promise<VideoGenerationResponse> {
        this.validateConfiguration();

        const model = dto.model || this.defaultModel;
        this.logger.log(`Text-to-Video generation with model: ${model}`);

        try {
            const requestBody = this.buildTextToVideoRequest(dto);
            const operationName = await this.startVideoGeneration(model, requestBody);
            const result = await this.completeVideoGeneration(operationName, dto.prompt, model, dto);

            // Save to Supabase if userId provided (authenticated user)
            if (dto.userId && result.url) {
                await this.mediaStorage.saveMedia({
                    userId: dto.userId,
                    mediaType: 'video',
                    url: result.url,
                    gcsUri: result.gcsUri,
                    filename: result.filename,
                    mimeType: 'video/mp4',
                    model: model,
                    prompt: dto.prompt,
                    negativePrompt: dto.negativePrompt,
                    apiVersion: 'v1',
                    endpoint: 'text-to-video',
                    metadata: {
                        aspectRatio: dto.aspectRatio,
                        resolution: dto.resolution,
                        durationSeconds: dto.durationSeconds,
                        hasAudio: dto.generateAudio,
                    },
                });
                this.logger.log(`Saved video to Supabase for user ${dto.userId}`);
            }

            return result;
        } catch (error: any) {
            this.handleError(error, 'Text-to-Video');
        }
    }

    /**
     * Generate video from image
     */
    async imageToVideo(dto: ImageToVideoDto): Promise<VideoGenerationResponse> {
        this.validateConfiguration();

        const model = dto.model || this.defaultModel;
        this.logger.log(`Image-to-Video generation with model: ${model}`);

        try {
            const requestBody = await this.buildImageToVideoRequest(dto);
            const operationName = await this.startVideoGeneration(model, requestBody);
            return await this.completeVideoGeneration(operationName, dto.prompt, model, dto);
        } catch (error: any) {
            this.handleError(error, 'Image-to-Video');
        }
    }

    /**
     * Extend an existing video
     */
    async extendVideo(dto: VideoExtendDto): Promise<VideoGenerationResponse> {
        this.validateConfiguration();

        const model = dto.model || this.defaultModel;
        this.logger.log(`Video extension with model: ${model}`);

        try {
            const requestBody = await this.buildVideoExtendRequest(dto);
            const operationName = await this.startVideoGeneration(model, requestBody);
            return await this.completeVideoGeneration(operationName, dto.prompt, model, {
                durationSeconds: dto.extensionSeconds,
            });
        } catch (error: any) {
            this.handleError(error, 'Video Extension');
        }
    }

    /**
     * Generate video between first and last frame
     */
    async interpolateFrames(dto: FrameInterpolationDto): Promise<VideoGenerationResponse> {
        this.validateConfiguration();

        const model = dto.model || this.defaultModel;
        this.logger.log(`Frame interpolation with model: ${model}`);

        try {
            const requestBody = await this.buildFrameInterpolationRequest(dto);
            const operationName = await this.startVideoGeneration(model, requestBody);
            return await this.completeVideoGeneration(operationName, dto.prompt, model, dto);
        } catch (error: any) {
            this.handleError(error, 'Frame Interpolation');
        }
    }

    /**
     * Generate video with reference images
     */
    async generateWithReferences(dto: VideoWithReferencesDto): Promise<VideoGenerationResponse> {
        this.validateConfiguration();

        const model = dto.model || this.defaultModel;
        this.logger.log(`Video with references, model: ${model}`);

        try {
            const requestBody = await this.buildVideoWithReferencesRequest(dto);
            const operationName = await this.startVideoGeneration(model, requestBody);
            return await this.completeVideoGeneration(operationName, dto.prompt, model, dto);
        } catch (error: any) {
            this.handleError(error, 'Video with References');
        }
    }

    /**
     * Get operation status
     */
    async getOperationStatus(operationId: string): Promise<VideoOperationStatus> {
        // Per Veo API docs: use POST to :fetchPredictOperation endpoint
        // operationId can be full path or just the operation ID

        // Ensure we have the full operation name format
        const operationName = operationId.includes('projects/')
            ? operationId
            : `projects/${this.projectId}/locations/${this.location}/publishers/google/models/veo-3.0-generate-001/operations/${operationId}`;

        // Extract model ID from operation name
        const match = operationName.match(/\/models\/([^\/]+)\/operations\//);
        const modelId = match ? match[1] : 'veo-3.0-generate-001';

        const url = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${modelId}:fetchPredictOperation`;

        const { GoogleAuth } = await import('google-auth-library');
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const accessToken = await auth.getAccessToken();

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                operationName: operationName,
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            this.logger.error(`Operation status error: ${response.status} - ${text}`);

            try {
                const error = JSON.parse(text);
                throw new HttpException(
                    error.error?.message || 'Failed to get operation status',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            } catch (parseError) {
                throw new HttpException(
                    `Failed to get operation status: HTTP ${response.status}`,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }

        const data = await response.json();

        if (data.done === true) {
            if (data.error) {
                return {
                    operationId,
                    status: 'FAILED',
                    error: data.error.message,
                };
            }

            // Vertex AI returns videos array
            const videos = data.response?.videos;
            if (videos && videos.length > 0) {
                const firstVideo = videos[0];

                // Handle GCS URI
                if (firstVideo.gcsUri) {
                    const videoBuffer = await this.downloadVideoFromGcs(firstVideo.gcsUri);
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
                            model: modelId,
                            duration: 0,
                            resolution: '',
                            aspectRatio: '',
                            generatedAt: new Date().toISOString(),
                        },
                    };
                }
            }
        }

        return {
            operationId,
            status: 'RUNNING',
            progress: data.metadata?.progressPercent || 50,
        };
    }

    // ==================== Request Builders ====================

    private buildTextToVideoRequest(dto: TextToVideoDto): any {
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

        return {
            instances: [{
                prompt: dto.prompt,
                video: videoData,
            }],
            parameters: {
                durationSeconds: dto.extensionSeconds,
                generateAudio: dto.generateAudio,
            },
        };
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

        return {
            instances: [instance],
            parameters: {
                aspectRatio: dto.aspectRatio,
                durationSeconds: dto.durationSeconds,
                generateAudio: dto.generateAudio,
            },
        };
    }

    // ==================== Helper Methods ====================

    private validateConfiguration(): void {
        if (!this.projectId) {
            throw new HttpException(
                'Video service not configured. Missing GOOGLE_CLOUD_PROJECT.',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }

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

    private async startVideoGeneration(model: string, requestBody: any): Promise<string> {
        // Use Vertex AI endpoint (NOT Gemini API)
        const url = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${model}:predictLongRunning`;

        this.logger.debug(`Starting video generation at Vertex AI: ${url}`);
        this.logger.debug(`Request body: ${JSON.stringify(requestBody, null, 2)}`);

        // Use Google Cloud credentials
        const { GoogleAuth } = await import('google-auth-library');
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const accessToken = await auth.getAccessToken();

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const error = await response.json();
            this.logger.error(`Vertex AI error: ${JSON.stringify(error)}`);
            throw new Error(error.error?.message || 'Failed to start video generation');
        }

        const data = await response.json();
        this.logger.log(`Video operation started: ${data.name}`);
        return data.name;
    }

    private async pollOperation(operationName: string): Promise<any> {
        // Per Veo API docs: use POST to :fetchPredictOperation endpoint
        // operationName format: projects/PROJECT_ID/locations/LOCATION/publishers/google/models/MODEL_ID/operations/OPERATION_ID

        // Extract model ID from operation name to build the correct endpoint
        const match = operationName.match(/\/models\/([^\/]+)\/operations\//);
        const modelId = match ? match[1] : 'veo-3.0-generate-001';

        const url = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${modelId}:fetchPredictOperation`;

        const maxAttempts = 120;
        const pollInterval = 10000;

        const { GoogleAuth } = await import('google-auth-library');
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            this.logger.debug(`Polling attempt ${attempt + 1}/${maxAttempts}`);
            this.logger.debug(`Polling URL: ${url}`);
            this.logger.debug(`Operation name: ${operationName}`);

            const accessToken = await auth.getAccessToken();

            // Per Veo API docs: POST with operationName in body
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    operationName: operationName,
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                this.logger.error(`Poll response not OK: ${response.status} - ${text}`);

                // Try to parse as JSON, but handle HTML error pages
                try {
                    const error = JSON.parse(text);
                    throw new Error(error.error?.message || 'Failed to check operation status');
                } catch (parseError) {
                    throw new Error(`Failed to check operation status: HTTP ${response.status}`);
                }
            }

            const data = await response.json();

            if (data.done === true) {
                if (data.error) {
                    throw new Error(data.error.message || 'Video generation failed');
                }

                // Vertex AI returns videos array directly
                const videos = data.response?.videos;
                if (!videos || videos.length === 0) {
                    throw new Error('No videos in response');
                }

                this.logger.log('Video generation completed');
                return data.response;
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        throw new Error('Video generation timed out after 20 minutes');
    }

    private async downloadVideoFromGcs(gcsUri: string): Promise<Buffer> {
        // gcsUri format: gs://bucket/path/to/video.mp4
        // Convert to public URL or use GCS client
        const { Storage } = await import('@google-cloud/storage');
        const storage = new Storage();

        // Parse gs:// URI
        const match = gcsUri.match(/^gs:\/\/([^\/]+)\/(.+)$/);
        if (!match) {
            throw new Error(`Invalid GCS URI: ${gcsUri}`);
        }

        const [, bucketName, filePath] = match;
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(filePath);

        const [buffer] = await file.download();
        this.logger.log(`Downloaded video from GCS: ${gcsUri}`);
        return buffer;
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

        const result = await this.gcsStorage.uploadBuffer(videoBuffer, path, 'video/mp4');

        this.logger.log(`Video uploaded to GCS: ${result.gcsUri}`);

        return {
            publicUrl: result.publicUrl,
            gcsUri: result.gcsUri,
            filename,
        };
    }

    private async completeVideoGeneration(
        operationName: string,
        prompt: string,
        model: string,
        options: any,
    ): Promise<VideoGenerationResponse> {
        // pollOperation now returns full response object with videos array
        const response = await this.pollOperation(operationName);
        const videos = response.videos;

        // Get first video - Vertex AI returns gcsUri directly
        const firstVideo = videos[0];

        // If storageUri was provided, video is already in GCS
        if (firstVideo.gcsUri) {
            const gcsUri = firstVideo.gcsUri;
            // Copy to our bucket for consistent access
            const videoBuffer = await this.downloadVideoFromGcs(gcsUri);
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

        // Handle base64 encoded video (when no storageUri was provided)
        if (firstVideo.bytesBase64Encoded) {
            const videoBuffer = Buffer.from(firstVideo.bytesBase64Encoded, 'base64');
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

        throw new Error('No video data in response');
    }

    private handleError(error: any, operation: string): never {
        this.logger.error(`${operation} failed:`, error);

        if (error instanceof HttpException) throw error;

        const message = error.message || `${operation} failed`;

        if (message.includes('safety') || message.includes('blocked')) {
            throw new HttpException(
                'Generation blocked by safety filters.',
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
        return !!this.projectId;
    }

    getSupportedModels(): string[] {
        return [...VEO_MODELS];
    }
}
