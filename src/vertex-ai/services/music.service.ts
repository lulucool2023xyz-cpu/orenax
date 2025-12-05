import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GcsStorageService } from './gcs-storage.service';
import {
    LyriaMusicGenerationDto,
    MusicGenerationResponse,
    MusicTrack,
} from '../dto/music-request.dto';

/**
 * Lyria Music Service for API V1
 * 
 * Model: lyria-002
 * Features:
 * - Text-to-music generation (instrumental only)
 * - Negative prompting
 * - Seed for reproducibility
 * - Sample count for variations
 * 
 * Output: 32.8 seconds WAV at 48kHz
 * 
 * All outputs saved to GCS
 */
@Injectable()
export class MusicService {
    private readonly logger = new Logger(MusicService.name);
    private readonly projectId: string;
    private readonly location: string;
    private readonly model = 'lyria-002';

    constructor(
        private readonly configService: ConfigService,
        private readonly gcsStorage: GcsStorageService,
    ) {
        this.projectId = this.configService.get<string>('GOOGLE_CLOUD_PROJECT') || '';
        this.location = this.configService.get<string>('VERTEX_AI_LOCATION') || 'us-central1';

        if (this.projectId) {
            this.logger.log(`Lyria Music Service initialized: project=${this.projectId}`);
        } else {
            this.logger.warn('GOOGLE_CLOUD_PROJECT not configured - music generation disabled');
        }
    }

    /**
     * Generate music from text prompt
     */
    async generateMusic(dto: LyriaMusicGenerationDto): Promise<MusicGenerationResponse> {
        this.validateConfiguration();

        this.logger.log(`Music generation request: "${dto.prompt.substring(0, 50)}..."`);

        try {
            const accessToken = await this.getAccessToken();
            const endpoint = this.getEndpoint();

            // Build request body
            const requestBody = this.buildRequest(dto);

            this.logger.debug(`Lyria request: ${JSON.stringify(requestBody)}`);

            // Call Vertex AI predict API
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Music generation failed');
            }

            const data = await response.json();

            // Extract and upload audio tracks
            const tracks = await this.processResponse(data, dto.prompt);

            this.logger.log(`Generated ${tracks.length} music track(s)`);

            return {
                success: true,
                tracks,
                model: this.model,
                generatedAt: new Date().toISOString(),
            };
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Build Lyria API request
     */
    private buildRequest(dto: LyriaMusicGenerationDto): any {
        const instance: any = {
            prompt: dto.prompt,
        };

        if (dto.negativePrompt) {
            instance.negative_prompt = dto.negativePrompt;
        }

        // seed and sample_count are mutually exclusive
        if (dto.seed !== undefined) {
            instance.seed = dto.seed;
        }

        const request: any = {
            instances: [instance],
            parameters: {},
        };

        // Only add sample_count if seed is not provided
        if (dto.sampleCount !== undefined && dto.seed === undefined) {
            request.parameters.sample_count = dto.sampleCount;
        }

        return request;
    }

    /**
     * Process response and upload to GCS
     */
    private async processResponse(response: any, prompt: string): Promise<MusicTrack[]> {
        if (!response.predictions || response.predictions.length === 0) {
            throw new Error('No music generated');
        }

        const tracks: MusicTrack[] = [];

        for (let i = 0; i < response.predictions.length; i++) {
            const prediction = response.predictions[i];

            if (!prediction.audioContent) {
                this.logger.warn(`Prediction ${i} has no audio content`);
                continue;
            }

            // Upload to GCS
            const uploadResult = await this.uploadToGcs(
                prediction.audioContent,
                prompt,
                i,
            );

            tracks.push({
                url: uploadResult.publicUrl,
                publicUrl: uploadResult.publicUrl,
                gcsUri: uploadResult.gcsUri,
                filename: uploadResult.filename,
                mimeType: prediction.mimeType || 'audio/wav',
                duration: 32.8, // Fixed duration for Lyria
                sampleRate: 48000, // Fixed sample rate
                prompt,
            });
        }

        return tracks;
    }

    /**
     * Upload audio to GCS
     */
    private async uploadToGcs(
        base64Audio: string,
        prompt: string,
        index: number,
    ): Promise<{ publicUrl: string; gcsUri: string; filename: string }> {
        const date = new Date();
        const datePath = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
        const filename = `lyria-music-${Date.now()}-${index}-${Math.random().toString(36).substring(7)}.wav`;
        const path = `music/${datePath}/${filename}`;

        const buffer = Buffer.from(base64Audio, 'base64');
        const result = await this.gcsStorage.uploadBuffer(buffer, path, 'audio/wav');

        this.logger.log(`Music uploaded to GCS: ${result.gcsUri}`);

        return {
            publicUrl: result.publicUrl,
            gcsUri: result.gcsUri,
            filename,
        };
    }

    /**
     * Get Vertex AI endpoint
     */
    private getEndpoint(): string {
        return `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.model}:predict`;
    }

    /**
     * Get access token for Vertex AI
     */
    private async getAccessToken(): Promise<string> {
        // Use gcloud credentials or service account
        const { GoogleAuth } = await import('google-auth-library');
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        return tokenResponse.token || '';
    }

    /**
     * Validate configuration
     */
    private validateConfiguration(): void {
        if (!this.projectId) {
            throw new HttpException(
                'Music service not configured. Missing GOOGLE_CLOUD_PROJECT.',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }

    /**
     * Handle errors
     */
    private handleError(error: any): never {
        this.logger.error('Music generation failed:', error);

        if (error instanceof HttpException) throw error;

        const message = error.message || 'Music generation failed';

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
            `Music generation failed: ${message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    /**
     * Check if service is configured
     */
    isConfigured(): boolean {
        return !!this.projectId;
    }
}
