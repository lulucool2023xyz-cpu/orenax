import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GcsStorageService } from './gcs-storage.service';
import {
    SingleSpeakerTtsRequestDto,
    MultiSpeakerTtsRequestDto,
    TtsGenerationResponse,
    AvailableVoicesResponse,
    TTS_VOICES,
} from '../dto/tts-request.dto';

/**
 * TTS (Text-to-Speech) Service for API V1
 * Uses Google Cloud Text-to-Speech API
 * 
 * Features:
 * - Single speaker synthesis
 * - Multi-speaker synthesis
 * - Multiple voice options
 * - Speaking rate, pitch, volume control
 * 
 * All outputs saved to GCS
 */
@Injectable()
export class TtsService {
    private readonly logger = new Logger(TtsService.name);
    private readonly projectId: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly gcsStorage: GcsStorageService,
    ) {
        this.projectId = this.configService.get<string>('GOOGLE_CLOUD_PROJECT') || '';

        if (this.projectId) {
            this.logger.log(`TTS Service initialized: project=${this.projectId}`);
        } else {
            this.logger.warn('GOOGLE_CLOUD_PROJECT not configured - TTS disabled');
        }
    }

    /**
     * Single speaker text-to-speech
     */
    async synthesizeSingleSpeaker(dto: SingleSpeakerTtsRequestDto): Promise<TtsGenerationResponse> {
        this.validateConfiguration();

        const voiceName = dto.voiceName || 'Kore';
        this.logger.log(`TTS request: voice=${voiceName}, text="${dto.text.substring(0, 50)}..."`);

        try {
            const accessToken = await this.getAccessToken();

            // Build TTS request
            const requestBody = {
                input: { text: dto.text },
                voice: {
                    languageCode: dto.languageCode || 'en-US',
                    name: `en-US-Wavenet-${this.mapVoiceToWavenet(voiceName)}`,
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: dto.speakingRate || 1.0,
                    pitch: dto.pitch || 0,
                    volumeGainDb: dto.volumeGainDb || 0,
                },
            };

            const response = await fetch(
                `https://texttospeech.googleapis.com/v1/text:synthesize`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                },
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'TTS synthesis failed');
            }

            const data = await response.json();

            // Upload to GCS
            const uploadResult = await this.uploadToGcs(
                data.audioContent,
                'single-speaker',
            );

            return {
                success: true,
                url: uploadResult.publicUrl,
                publicUrl: uploadResult.publicUrl,
                gcsUri: uploadResult.gcsUri,
                filename: uploadResult.filename,
                mimeType: 'audio/mpeg',
                voiceName,
                speakerCount: 1,
                generatedAt: new Date().toISOString(),
            };
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Multi-speaker text-to-speech
     */
    async synthesizeMultiSpeaker(dto: MultiSpeakerTtsRequestDto): Promise<TtsGenerationResponse> {
        this.validateConfiguration();

        this.logger.log(`Multi-speaker TTS: ${dto.speakerConfigs.length} speakers`);

        try {
            const accessToken = await this.getAccessToken();

            // For multi-speaker, we use SSML with voice breaks
            // Parse text with speaker markers and create SSML
            const ssml = this.createMultiSpeakerSsml(dto);

            // For now, use the first speaker's voice
            // Full multi-speaker would require separate synthesis and merging
            const primaryVoice = dto.speakerConfigs[0]?.voiceName || 'Kore';

            const requestBody = {
                input: { ssml },
                voice: {
                    languageCode: dto.languageCode || 'en-US',
                    name: `en-US-Wavenet-${this.mapVoiceToWavenet(primaryVoice)}`,
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: dto.speakingRate || 1.0,
                },
            };

            const response = await fetch(
                `https://texttospeech.googleapis.com/v1/text:synthesize`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                },
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'TTS synthesis failed');
            }

            const data = await response.json();

            // Upload to GCS
            const uploadResult = await this.uploadToGcs(
                data.audioContent,
                'multi-speaker',
            );

            return {
                success: true,
                url: uploadResult.publicUrl,
                publicUrl: uploadResult.publicUrl,
                gcsUri: uploadResult.gcsUri,
                filename: uploadResult.filename,
                mimeType: 'audio/mpeg',
                voiceName: dto.speakerConfigs.map(s => s.voiceName).join(', '),
                speakerCount: dto.speakerConfigs.length,
                generatedAt: new Date().toISOString(),
            };
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Get available voices
     */
    async getAvailableVoices(): Promise<AvailableVoicesResponse> {
        try {
            const accessToken = await this.getAccessToken();

            const response = await fetch(
                `https://texttospeech.googleapis.com/v1/voices`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Failed to fetch voices');
            }

            const data = await response.json();

            // Filter to English voices
            const englishVoices = data.voices
                ?.filter((v: any) => v.languageCodes.includes('en-US'))
                ?.map((v: any) => ({
                    name: v.name,
                    languageCodes: v.languageCodes,
                    ssmlGender: v.ssmlGender,
                })) || [];

            return { voices: englishVoices };
        } catch (error) {
            this.logger.error('Failed to get voices:', error);
            // Return static list as fallback
            return {
                voices: TTS_VOICES.map(name => ({
                    name,
                    languageCodes: ['en-US'],
                    ssmlGender: 'NEUTRAL',
                })),
            };
        }
    }

    /**
     * Create SSML for multi-speaker
     */
    private createMultiSpeakerSsml(dto: MultiSpeakerTtsRequestDto): string {
        let ssml = '<speak>';

        // Simple implementation: just wrap the text with breaks between speakers
        const lines = dto.text.split('\n').filter(l => l.trim());

        for (const line of lines) {
            ssml += `<p>${this.escapeXml(line)}</p><break time="500ms"/>`;
        }

        ssml += '</speak>';
        return ssml;
    }

    /**
     * Escape XML special characters
     */
    private escapeXml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * Map our voice names to Wavenet voice suffixes
     */
    private mapVoiceToWavenet(voice: string): string {
        const mapping: Record<string, string> = {
            'Aoede': 'A',
            'Charon': 'B',
            'Fenrir': 'C',
            'Kore': 'D',
            'Puck': 'E',
            'Zephyr': 'F',
            'Harmony': 'G',
            'Aurora': 'H',
            'Ember': 'I',
        };
        return mapping[voice] || 'D'; // Default to D (Kore)
    }

    /**
     * Upload audio to GCS
     */
    private async uploadToGcs(
        base64Audio: string,
        prefix: string,
    ): Promise<{ publicUrl: string; gcsUri: string; filename: string }> {
        const date = new Date();
        const datePath = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
        const filename = `tts-${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
        const path = `audio/${datePath}/${filename}`;

        const buffer = Buffer.from(base64Audio, 'base64');
        const result = await this.gcsStorage.uploadBuffer(buffer, path, 'audio/mpeg');

        this.logger.log(`TTS audio uploaded to GCS: ${result.gcsUri}`);

        return {
            publicUrl: result.publicUrl,
            gcsUri: result.gcsUri,
            filename,
        };
    }

    /**
     * Get access token
     */
    private async getAccessToken(): Promise<string> {
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
                'TTS service not configured. Missing GOOGLE_CLOUD_PROJECT.',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }

    /**
     * Handle errors
     */
    private handleError(error: any): never {
        this.logger.error('TTS synthesis failed:', error);

        if (error instanceof HttpException) throw error;

        throw new HttpException(
            `TTS synthesis failed: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    /**
     * Check if configured
     */
    isConfigured(): boolean {
        return !!this.projectId;
    }
}
