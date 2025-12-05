import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GcsStorageService } from '../../vertex-ai/services/gcs-storage.service';
import { GeminiMusicGenerationDto, MusicGenerationResponse } from '../dto/gemini-music.dto';

/**
 * Lyria Music Generation Service
 * Uses WebSocket for real-time streaming, collects audio buffer, uploads to GCS
 * 
 * Note: Lyria RealTime normally uses continuous WebSocket streaming.
 * For HTTP sync endpoint, we collect audio chunks until duration is reached.
 */
@Injectable()
export class GeminiMusicService {
    private readonly logger = new Logger(GeminiMusicService.name);
    private readonly apiKey: string;
    private readonly wsUrl = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';
    private readonly model = 'models/lyria-realtime-exp';

    // Audio specifications from Lyria
    private readonly sampleRate = 48000;
    private readonly channels = 2;
    private readonly bitDepth = 16;

    constructor(
        private readonly configService: ConfigService,
        private readonly gcsStorage: GcsStorageService,
    ) {
        this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
        if (!this.apiKey) {
            this.logger.warn('GEMINI_API_KEY not configured - music generation will not work');
        } else {
            this.logger.log('Lyria Music Service initialized');
        }
    }

    /**
     * Generate music from prompts
     */
    async generateMusic(dto: GeminiMusicGenerationDto): Promise<MusicGenerationResponse> {
        if (!this.apiKey) {
            throw new HttpException(
                'Music generation service not configured. Missing GEMINI_API_KEY.',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }

        const duration = dto.durationSeconds || 30;
        const bpm = dto.bpm || 120;

        this.logger.log(`Starting music generation, duration: ${duration}s`);
        this.logger.debug(`Prompts: ${JSON.stringify(dto.prompts)}`);

        try {
            // Generate music using WebSocket
            const audioBuffer = await this.generateWithWebSocket(dto, duration);

            // Convert PCM to WAV
            const wavBuffer = this.createWavFile(audioBuffer);

            // Upload to GCS
            const uploadResult = await this.uploadToGcs(
                wavBuffer,
                dto.prompts,
                bpm,
            );

            return {
                url: uploadResult.url,
                filename: uploadResult.filename,
                prompts: dto.prompts,
                config: {
                    bpm,
                    duration,
                    scale: dto.scale,
                },
                generatedAt: new Date().toISOString(),
            };
        } catch (error) {
            this.logger.error('Music generation failed:', error);

            if (error instanceof HttpException) {
                throw error;
            }

            const message = error.message || 'Music generation failed';

            if (message.includes('safety') || message.includes('blocked')) {
                throw new HttpException(
                    'Music generation blocked due to safety filters. Please modify your prompts.',
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
                `Music generation failed: ${message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Generate music using WebSocket connection
     */
    private async generateWithWebSocket(
        dto: GeminiMusicGenerationDto,
        durationSeconds: number,
    ): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const WebSocket = require('ws');

            // Connect to Lyria WebSocket
            const wsUrlWithKey = `${this.wsUrl}?key=${this.apiKey}`;
            const ws = new WebSocket(wsUrlWithKey);

            const audioChunks: Buffer[] = [];
            let totalBytes = 0;

            // Calculate expected bytes for duration
            // 48000 Hz * 2 channels * 2 bytes (16-bit) * duration
            const expectedBytes = this.sampleRate * this.channels * (this.bitDepth / 8) * durationSeconds;

            const timeout = setTimeout(() => {
                ws.close();
                if (audioChunks.length > 0) {
                    resolve(Buffer.concat(audioChunks));
                } else {
                    reject(new Error('Music generation timed out'));
                }
            }, (durationSeconds + 10) * 1000); // Extra 10s buffer

            ws.on('open', () => {
                this.logger.log('WebSocket connected to Lyria');

                // Send setup message
                const setupMessage = {
                    setup: {
                        model: this.model,
                    },
                };
                ws.send(JSON.stringify(setupMessage));

                // Send weighted prompts
                const promptMessage = {
                    clientContent: {
                        turns: [{
                            role: 'user',
                            parts: [{
                                text: JSON.stringify({
                                    weightedPrompts: dto.prompts.map(p => ({
                                        text: p.text,
                                        weight: p.weight,
                                    })),
                                }),
                            }],
                        }],
                    },
                };
                ws.send(JSON.stringify(promptMessage));

                // Send music generation config
                const configMessage = {
                    realtimeInput: {
                        musicGenerationConfig: {
                            bpm: dto.bpm || 120,
                            temperature: dto.temperature || 1.0,
                            density: dto.density,
                            brightness: dto.brightness,
                            scale: dto.scale,
                        },
                    },
                };
                ws.send(JSON.stringify(configMessage));

                // Start playback
                const playMessage = {
                    realtimeInput: {
                        playbackControl: 'PLAY',
                    },
                };
                ws.send(JSON.stringify(playMessage));
            });

            ws.on('message', (data: Buffer | string) => {
                try {
                    const message = typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString());

                    if (message.serverContent?.audioChunks) {
                        for (const chunk of message.serverContent.audioChunks) {
                            if (chunk.data) {
                                const audioBuffer = Buffer.from(chunk.data, 'base64');
                                audioChunks.push(audioBuffer);
                                totalBytes += audioBuffer.length;

                                // Check if we have enough audio
                                if (totalBytes >= expectedBytes) {
                                    clearTimeout(timeout);
                                    ws.close();
                                    resolve(Buffer.concat(audioChunks));
                                    return;
                                }
                            }
                        }
                    }
                } catch (e) {
                    // Ignore parse errors for binary data
                }
            });

            ws.on('error', (error: Error) => {
                clearTimeout(timeout);
                this.logger.error('WebSocket error:', error);
                reject(error);
            });

            ws.on('close', () => {
                clearTimeout(timeout);
                this.logger.log('WebSocket closed');

                if (audioChunks.length > 0) {
                    resolve(Buffer.concat(audioChunks));
                }
            });
        });
    }

    /**
     * Create WAV file from PCM buffer
     */
    private createWavFile(pcmBuffer: Buffer): Buffer {
        const dataSize = pcmBuffer.length;
        const fileSize = 44 + dataSize;

        const wavBuffer = Buffer.alloc(fileSize);

        // RIFF header
        wavBuffer.write('RIFF', 0);
        wavBuffer.writeUInt32LE(fileSize - 8, 4);
        wavBuffer.write('WAVE', 8);

        // fmt chunk
        wavBuffer.write('fmt ', 12);
        wavBuffer.writeUInt32LE(16, 16); // Chunk size
        wavBuffer.writeUInt16LE(1, 20); // Audio format (PCM)
        wavBuffer.writeUInt16LE(this.channels, 22); // Channels
        wavBuffer.writeUInt32LE(this.sampleRate, 24); // Sample rate
        wavBuffer.writeUInt32LE(this.sampleRate * this.channels * (this.bitDepth / 8), 28); // Byte rate
        wavBuffer.writeUInt16LE(this.channels * (this.bitDepth / 8), 32); // Block align
        wavBuffer.writeUInt16LE(this.bitDepth, 34); // Bits per sample

        // data chunk
        wavBuffer.write('data', 36);
        wavBuffer.writeUInt32LE(dataSize, 40);
        pcmBuffer.copy(wavBuffer, 44);

        return wavBuffer;
    }

    /**
     * Upload audio to GCS
     */
    private async uploadToGcs(
        audioBuffer: Buffer,
        prompts: Array<{ text: string; weight: number }>,
        bpm: number,
    ): Promise<{ url: string; filename: string }> {
        const base64Data = audioBuffer.toString('base64');
        const promptText = prompts.map(p => p.text).join(', ');

        const result = await this.gcsStorage.uploadGeneratedImage(
            base64Data,
            {
                model: 'lyria-realtime-exp',
                feature: 'music-generation',
                generatedAt: new Date(),
                prompt: promptText,
                parameters: { bpm },
            },
            'audio/wav',
        );

        this.logger.log(`Audio uploaded to GCS: ${result.url}`);
        return { url: result.url, filename: result.filename };
    }

    /**
     * Check service availability
     */
    isConfigured(): boolean {
        return !!this.apiKey;
    }
}
