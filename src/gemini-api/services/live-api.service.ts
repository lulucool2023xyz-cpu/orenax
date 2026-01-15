import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Modality, Session } from '@google/genai';

interface LiveSession {
    session: Session;
    clientId: string;
    createdAt: Date;
}

@Injectable()
export class LiveApiService implements OnModuleDestroy {
    private readonly logger = new Logger(LiveApiService.name);
    private readonly ai: GoogleGenAI;
    private readonly sessions: Map<string, LiveSession> = new Map();

    constructor(private readonly configService: ConfigService) {
        // Use GEMINI_API_KEY as standard in this project
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.warn('GEMINI_API_KEY not configured');
        }
        this.ai = new GoogleGenAI({ apiKey });
    }

    async onModuleDestroy() {
        for (const [clientId, liveSession] of this.sessions) {
            try {
                liveSession.session.close();
                this.logger.log(`Closed session for client: ${clientId}`);
            } catch (error) {
                this.logger.error(`Error closing session for ${clientId}:`, error);
            }
        }
        this.sessions.clear();
    }

    async createSession(
        clientId: string,
        systemInstruction: string | undefined, // Add this
        onMessage: (message: any) => void,
        onError: (error: Error) => void,
        onClose: (event: any) => void,
    ): Promise<Session> {
        // Close existing session if any
        if (this.sessions.has(clientId)) {
            await this.closeSession(clientId);
        }

        // Model for native audio - from docs/reference
        const model = 'gemini-2.5-flash-native-audio-preview-12-2025';

        // Config based on Live API docs
        const config = {
            responseModalities: [Modality.AUDIO],
            systemInstruction: systemInstruction || 'You are a helpful assistant. Respond in a friendly and concise manner.',
            // Enable transcription
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        };

        this.logger.log(`Creating Live API session for client: ${clientId}`);
        this.logger.log(`Model: ${model}`);

        try {
            const session = await this.ai.live.connect({
                model,
                config,
                callbacks: {
                    onopen: () => {
                        this.logger.log(`✅ Live API session OPENED for client: ${clientId}`);
                    },
                    onmessage: (message: any) => {
                        // Log message type for debugging
                        if (message.setupComplete) {
                            this.logger.log(`Setup complete for ${clientId}`);
                        }
                        if (message.serverContent?.modelTurn?.parts) {
                            this.logger.log(`Received modelTurn with ${message.serverContent.modelTurn.parts.length} parts`);
                        }
                        if (message.serverContent?.inputTranscription) {
                            this.logger.log(`Input transcription: ${message.serverContent.inputTranscription.text}`);
                        }
                        if (message.serverContent?.outputTranscription) {
                            this.logger.log(`Output transcription: ${message.serverContent.outputTranscription.text}`);
                        }
                        if (message.serverContent?.turnComplete) {
                            this.logger.log(`Turn complete for ${clientId}`);
                        }
                        onMessage(message);
                    },
                    onerror: (error: any) => {
                        this.logger.error(`❌ Live API error for ${clientId}:`, error);
                        onError(error);
                    },
                    onclose: (event: any) => {
                        this.logger.log(`🔌 Live API session closed for ${clientId}`);
                        this.sessions.delete(clientId);
                        onClose(event);
                    },
                },
            });

            this.sessions.set(clientId, {
                session,
                clientId,
                createdAt: new Date(),
            });

            this.logger.log(`✅ Session created successfully for client: ${clientId}`);
            return session;
        } catch (error) {
            this.logger.error(`Failed to create session for ${clientId}:`, error);
            throw error;
        }
    }

    // Send realtime audio input - per docs: session.sendRealtimeInput({ audio: { data, mimeType } })
    async sendAudio(clientId: string, audioData: string, mimeType: string = 'audio/pcm;rate=16000') {
        const liveSession = this.sessions.get(clientId);
        if (!liveSession) {
            this.logger.warn(`No active session for client: ${clientId}`);
            return;
        }

        try {
            // Per Live API docs - use sendRealtimeInput for streaming audio
            liveSession.session.sendRealtimeInput({
                audio: {
                    data: audioData,
                    mimeType,
                },
            });
        } catch (error) {
            this.logger.error(`Error sending audio for ${clientId}:`, error);
            throw error;
        }
    }

    // Send realtime video input
    async sendVideo(clientId: string, videoData: string, mimeType: string = 'image/jpeg') {
        const liveSession = this.sessions.get(clientId);
        if (!liveSession) {
            this.logger.warn(`No active session for client: ${clientId}`);
            return;
        }

        try {
            liveSession.session.sendRealtimeInput({
                video: {
                    data: videoData,
                    mimeType,
                },
            });
        } catch (error) {
            this.logger.error(`Error sending video for ${clientId}:`, error);
            throw error;
        }
    }

    // Send text using sendClientContent - per docs
    async sendText(clientId: string, text: string) {
        const liveSession = this.sessions.get(clientId);
        if (!liveSession) {
            this.logger.warn(`No active session for client: ${clientId}`);
            return;
        }

        try {
            // Per docs - use sendClientContent for text
            liveSession.session.sendClientContent({
                turns: text,
                turnComplete: true,
            });
        } catch (error) {
            this.logger.error(`Error sending text for ${clientId}:`, error);
            throw error;
        }
    }

    async closeSession(clientId: string) {
        const liveSession = this.sessions.get(clientId);
        if (liveSession) {
            try {
                liveSession.session.close();
                this.sessions.delete(clientId);
                this.logger.log(`Closed session for client: ${clientId}`);
            } catch (error) {
                this.logger.error(`Error closing session for ${clientId}:`, error);
            }
        }
    }

    hasSession(clientId: string): boolean {
        return this.sessions.has(clientId);
    }
}
