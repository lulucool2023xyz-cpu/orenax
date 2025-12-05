import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GcsStorageService } from '../../vertex-ai/services/gcs-storage.service';
import {
    SingleSpeakerTtsDto,
    MultiSpeakerTtsDto,
    TtsResponse,
    VoiceInfo,
    VoicesResponse,
    TtsStatusResponse,
} from '../dto/tts.dto';

/**
 * Text-to-Speech Service
 * Generates audio from text using Gemini TTS models
 * 
 * Supported models:
 * - gemini-2.5-flash-preview-tts
 * - gemini-2.5-pro-preview-tts
 */
@Injectable()
export class TtsService {
    private readonly logger = new Logger(TtsService.name);
    private genAI: GoogleGenerativeAI | null = null;
    private readonly defaultModel = 'gemini-2.5-flash-preview-tts';

    // All 30 available voices
    private readonly availableVoices: VoiceInfo[] = [
        { name: 'Zephyr', tone: 'Bright', gender: 'neutral' },
        { name: 'Puck', tone: 'Upbeat', gender: 'neutral' },
        { name: 'Charon', tone: 'Informative', gender: 'neutral' },
        { name: 'Kore', tone: 'Firm', gender: 'neutral' },
        { name: 'Fenrir', tone: 'Excitable', gender: 'neutral' },
        { name: 'Leda', tone: 'Youthful', gender: 'neutral' },
        { name: 'Orus', tone: 'Firm', gender: 'neutral' },
        { name: 'Aoede', tone: 'Breezy', gender: 'neutral' },
        { name: 'Callirrhoe', tone: 'Easy-going', gender: 'neutral' },
        { name: 'Autonoe', tone: 'Bright', gender: 'neutral' },
        { name: 'Enceladus', tone: 'Breathy', gender: 'neutral' },
        { name: 'Iapetus', tone: 'Clear', gender: 'neutral' },
        { name: 'Umbriel', tone: 'Easy-going', gender: 'neutral' },
        { name: 'Algieba', tone: 'Smooth', gender: 'neutral' },
        { name: 'Despina', tone: 'Smooth', gender: 'neutral' },
        { name: 'Erinome', tone: 'Clear', gender: 'neutral' },
        { name: 'Algenib', tone: 'Gravelly', gender: 'neutral' },
        { name: 'Rasalgethi', tone: 'Informative', gender: 'neutral' },
        { name: 'Laomedeia', tone: 'Upbeat', gender: 'neutral' },
        { name: 'Achernar', tone: 'Soft', gender: 'neutral' },
        { name: 'Alnilam', tone: 'Firm', gender: 'neutral' },
        { name: 'Schedar', tone: 'Even', gender: 'neutral' },
        { name: 'Gacrux', tone: 'Mature', gender: 'neutral' },
        { name: 'Pulcherrima', tone: 'Forward', gender: 'neutral' },
        { name: 'Achird', tone: 'Friendly', gender: 'neutral' },
        { name: 'Zubenelgenubi', tone: 'Casual', gender: 'neutral' },
        { name: 'Vindemiatrix', tone: 'Gentle', gender: 'neutral' },
        { name: 'Sadachbia', tone: 'Lively', gender: 'neutral' },
        { name: 'Sadaltager', tone: 'Knowledgeable', gender: 'neutral' },
        { name: 'Sulafat', tone: 'Warm', gender: 'neutral' },
    ];

    constructor(
        private readonly configService: ConfigService,
        private readonly gcsStorage: GcsStorageService,
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.warn('GEMINI_API_KEY not configured - TTS will not work');
        } else {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.logger.log('TTS Service initialized');
        }
    }

    /**
     * Generate single-speaker audio from text
     */
    async generateSingleSpeaker(dto: SingleSpeakerTtsDto): Promise<TtsResponse> {
        if (!this.genAI) {
            throw new HttpException(
                'TTS service not configured. Missing GEMINI_API_KEY.',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        // Validate voice name
        const voiceExists = this.availableVoices.some(v =>
            v.name.toLowerCase() === dto.voiceName.toLowerCase()
        );
        if (!voiceExists) {
            throw new HttpException(
                `Voice '${dto.voiceName}' not found. Use GET /api/v2/tts/voices for available voices.`,
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
            const modelName = dto.model || this.defaultModel;
            this.logger.log(`Generating TTS with model: ${modelName}, voice: ${dto.voiceName}`);

            const model = this.genAI.getGenerativeModel({
                model: modelName,
            });

            // Build prompt with voice instructions
            const prompt = `[Voice: ${dto.voiceName}] ${dto.text}`;
            const result = await model.generateContent(prompt);
            const response = result.response;

            // Try to extract audio data from response
            let audioData: string | undefined;
            if (response.candidates && response.candidates.length > 0) {
                for (const candidate of response.candidates) {
                    if (candidate.content?.parts) {
                        for (const part of candidate.content.parts) {
                            if ((part as any).inlineData) {
                                audioData = (part as any).inlineData.data;
                                break;
                            }
                        }
                    }
                    if (audioData) break;
                }
            }

            // If no audio in response, return text response with message
            if (!audioData) {
                this.logger.warn('TTS model did not return audio. TTS preview models may not be available.');
                return {
                    text: dto.text,
                    voice: dto.voiceName,
                    model: modelName,
                    generatedAt: new Date().toISOString(),
                };
            }

            // Upload to GCS if requested
            let url: string | undefined;
            let filename: string | undefined;

            if (dto.uploadToGcs !== false) {
                const uploadResult = await this.uploadToGcs(
                    Buffer.from(audioData, 'base64'),
                    dto.text,
                    modelName,
                    'single',
                );
                url = uploadResult.url;
                filename = uploadResult.filename;
            }

            this.logger.log('TTS generation successful');

            return {
                url,
                base64Data: dto.uploadToGcs === false ? audioData : undefined,
                filename,
                text: dto.text,
                voice: dto.voiceName,
                model: modelName,
                generatedAt: new Date().toISOString(),
            };
        } catch (error) {
            this.logger.error('TTS generation failed:', error);

            if (error instanceof HttpException) {
                throw error;
            }

            const message = error.message || 'TTS generation failed';

            if (message.includes('safety') || message.includes('blocked')) {
                throw new HttpException(
                    'TTS generation blocked due to safety filters.',
                    HttpStatus.BAD_REQUEST,
                );
            }

            if (message.includes('quota') || message.includes('429')) {
                throw new HttpException(
                    'Rate limit exceeded. Please try again later.',
                    HttpStatus.TOO_MANY_REQUESTS,
                );
            }

            throw new HttpException(
                `TTS generation failed: ${message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Generate multi-speaker audio from text
     */
    async generateMultiSpeaker(dto: MultiSpeakerTtsDto): Promise<TtsResponse> {
        if (!this.genAI) {
            throw new HttpException(
                'TTS service not configured. Missing GEMINI_API_KEY.',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        // Validate speaker count
        if (dto.speakers.length > 2) {
            throw new HttpException(
                'Maximum 2 speakers allowed for multi-speaker TTS.',
                HttpStatus.BAD_REQUEST,
            );
        }

        if (dto.speakers.length < 2) {
            throw new HttpException(
                'At least 2 speakers required for multi-speaker TTS. Use single speaker endpoint instead.',
                HttpStatus.BAD_REQUEST,
            );
        }

        // Validate voice names
        for (const speaker of dto.speakers) {
            const voiceExists = this.availableVoices.some(v =>
                v.name.toLowerCase() === speaker.voiceName.toLowerCase()
            );
            if (!voiceExists) {
                throw new HttpException(
                    `Voice '${speaker.voiceName}' not found for speaker '${speaker.name}'.`,
                    HttpStatus.BAD_REQUEST,
                );
            }
        }

        try {
            const modelName = dto.model || this.defaultModel;
            this.logger.log(`Generating multi-speaker TTS with model: ${modelName}`);

            const model = this.genAI.getGenerativeModel({
                model: modelName,
            });

            // Build multi-speaker prompt with voice assignments
            const voiceAssignments = dto.speakers
                .map(s => `${s.name}: ${s.voiceName}`)
                .join(', ');
            const prompt = `[Multi-speaker audio with voices: ${voiceAssignments}]\n\n${dto.text}`;

            const result = await model.generateContent(prompt);
            const response = result.response;

            // Try to extract audio data from response
            let audioData: string | undefined;
            if (response.candidates && response.candidates.length > 0) {
                for (const candidate of response.candidates) {
                    if (candidate.content?.parts) {
                        for (const part of candidate.content.parts) {
                            if ((part as any).inlineData) {
                                audioData = (part as any).inlineData.data;
                                break;
                            }
                        }
                    }
                    if (audioData) break;
                }
            }

            // If no audio in response, return text response with message
            if (!audioData) {
                this.logger.warn('TTS model did not return audio. TTS preview models may not be available.');
                return {
                    text: dto.text,
                    speakers: dto.speakers,
                    model: modelName,
                    generatedAt: new Date().toISOString(),
                };
            }

            // Upload to GCS if requested
            let url: string | undefined;
            let filename: string | undefined;

            if (dto.uploadToGcs !== false) {
                const uploadResult = await this.uploadToGcs(
                    Buffer.from(audioData, 'base64'),
                    dto.text,
                    modelName,
                    'multi',
                );
                url = uploadResult.url;
                filename = uploadResult.filename;
            }

            this.logger.log('Multi-speaker TTS generation successful');

            return {
                url,
                base64Data: dto.uploadToGcs === false ? audioData : undefined,
                filename,
                text: dto.text,
                speakers: dto.speakers,
                model: modelName,
                generatedAt: new Date().toISOString(),
            };
        } catch (error) {
            this.logger.error('Multi-speaker TTS generation failed:', error);

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                `Multi-speaker TTS generation failed: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Upload audio to GCS
     */
    private async uploadToGcs(
        audioBuffer: Buffer,
        text: string,
        model: string,
        type: 'single' | 'multi',
    ): Promise<{ url: string; filename: string }> {
        try {
            const result = await this.gcsStorage.uploadGeneratedImage(
                audioBuffer.toString('base64'),
                {
                    model,
                    feature: `tts-${type}`,
                    generatedAt: new Date(),
                    prompt: text.substring(0, 200),
                },
                'audio/wav',
            );

            return {
                url: result.url,
                filename: result.filename,
            };
        } catch (error) {
            this.logger.error('Failed to upload TTS audio to GCS:', error);
            throw new HttpException(
                'Failed to upload audio to storage.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Get available voices
     */
    getVoices(): VoicesResponse {
        return {
            voices: this.availableVoices,
            total: this.availableVoices.length,
        };
    }

    /**
     * Get service status
     */
    getStatus(): TtsStatusResponse {
        return {
            available: !!this.genAI,
            models: [
                'gemini-2.5-flash-preview-tts',
                'gemini-2.5-pro-preview-tts',
            ],
            features: {
                maxSpeakers: 2,
                maxInputTokens: 32000,
                outputFormat: 'WAV (24kHz)',
                languagesSupported: 24,
            },
        };
    }

    /**
     * Check if service is configured
     */
    isConfigured(): boolean {
        return !!this.genAI;
    }
}
