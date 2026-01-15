import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import WebSocket from 'ws';

/**
 * Gemini Live API Gateway
 * Implements real-time bidirectional audio/video/text communication
 * 
 * IMPORTANT: This follows the exact Gemini Live API WebSocket spec:
 * - Endpoint: wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent
 * - Audio Input: 16-bit PCM, 16kHz, mono (audio/pcm;rate=16000)
 * - Audio Output: 16-bit PCM, 24kHz, mono
 * 
 * Flow:
 * 1. Client connects to this gateway via Socket.io
 * 2. Client sends 'setup' message with config
 * 3. Gateway connects to Gemini WebSocket and sends setup
 * 4. Gateway forwards messages bidirectionally
 */

interface SessionState {
    geminiWs: WebSocket | null;
    isSetupComplete: boolean;
    model: string;
    sessionHandle?: string;
}

@WebSocketGateway({
    namespace: '/live',
    cors: {
        origin: '*',
        credentials: true,
    },
})
export class LiveApiGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(LiveApiGateway.name);
    private sessions: Map<string, SessionState> = new Map();
    private readonly geminiApiKey: string;

    // Gemini Live API WebSocket URL (v1beta)
    private readonly GEMINI_WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

    constructor(private readonly configService: ConfigService) {
        this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY') || '';

        if (!this.geminiApiKey) {
            this.logger.error('❌ GEMINI_API_KEY not configured - Live API will not work!');
        } else {
            this.logger.log('✅ Live API Gateway initialized');
            this.logger.log(`   API Key: ${this.geminiApiKey.substring(0, 10)}...`);
        }
    }

    /**
     * Handle new client connection
     */
    handleConnection(client: Socket) {
        this.logger.log(`📱 Client connected: ${client.id}`);

        // Initialize session state
        this.sessions.set(client.id, {
            geminiWs: null,
            isSetupComplete: false,
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        });

        // Send connection acknowledgment
        client.emit('connected', {
            message: 'Connected to Live API Gateway',
            sessionId: client.id,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Handle client disconnect - clean up resources
     */
    handleDisconnect(client: Socket) {
        this.logger.log(`📴 Client disconnected: ${client.id}`);

        const session = this.sessions.get(client.id);
        if (session?.geminiWs) {
            try {
                session.geminiWs.close();
            } catch (e) {
                // Ignore close errors
            }
        }
        this.sessions.delete(client.id);
    }

    /**
     * Setup Live API session
     * 
     * Client sends: { setup: { model, generationConfig, systemInstruction, ... } }
     * 
     * Per Gemini docs, the setup message MUST be sent first after WebSocket opens
     */
    @SubscribeMessage('setup')
    async handleSetup(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { setup: any },
    ) {
        const config = payload.setup || payload;
        const session = this.sessions.get(client.id);

        if (!session) {
            this.logger.error(`No session found for client ${client.id}`);
            client.emit('error', { code: 'SESSION_NOT_FOUND', message: 'Session not found' });
            return;
        }

        if (!this.geminiApiKey) {
            client.emit('error', { code: 'API_KEY_MISSING', message: 'Gemini API key not configured' });
            return;
        }

        try {
            // Close existing Gemini connection if any
            if (session.geminiWs) {
                session.geminiWs.close();
                session.geminiWs = null;
            }

            const modelName = config.model || 'gemini-2.5-flash-native-audio-preview-12-2025';
            this.logger.log(`🚀 Setting up Live API for client ${client.id}`);
            this.logger.log(`   Model: ${modelName}`);

            // Connect to Gemini WebSocket
            const wsUrl = `${this.GEMINI_WS_URL}?key=${this.geminiApiKey}`;
            this.logger.log(`   Connecting to Gemini WebSocket...`);

            const geminiWs = new WebSocket(wsUrl);

            // Handle Gemini WebSocket open
            geminiWs.on('open', () => {
                this.logger.log(`✅ Gemini WebSocket opened for client ${client.id}`);

                // Build setup message per Gemini BidiGenerateContentSetup spec
                const setupMessage = {
                    setup: {
                        // Model must be in format "models/{model}"
                        model: modelName.startsWith('models/') ? modelName : `models/${modelName}`,

                        // Generation config
                        generationConfig: {
                            // Response modality - AUDIO for voice responses
                            responseModalities: config.generationConfig?.responseModalities || ['AUDIO'],

                            // Voice config for audio output
                            speechConfig: config.generationConfig?.speechConfig || {
                                voiceConfig: {
                                    prebuiltVoiceConfig: {
                                        voiceName: config.voice || 'Kore'
                                    },
                                },
                            },

                            // Generation parameters
                            temperature: config.generationConfig?.temperature ?? 0.7,
                            maxOutputTokens: config.generationConfig?.maxOutputTokens ?? 4096,
                        },

                        // System instruction (optional)
                        ...(config.systemInstruction && {
                            systemInstruction: typeof config.systemInstruction === 'string'
                                ? { parts: [{ text: config.systemInstruction }] }
                                : config.systemInstruction,
                        }),

                        // Audio transcription - enabled by default
                        inputAudioTranscription: config.inputAudioTranscription ?? {},
                        outputAudioTranscription: config.outputAudioTranscription ?? {},

                        // Realtime input config (VAD settings)
                        realtimeInputConfig: config.realtimeInputConfig ?? {
                            automaticActivityDetection: {
                                disabled: false,
                                startOfSpeechSensitivity: 'START_SENSITIVITY_HIGH',
                                endOfSpeechSensitivity: 'END_SENSITIVITY_HIGH',
                            },
                        },

                        // Tools (function calling, google search)
                        ...(config.tools && { tools: config.tools }),

                        // Thinking config for native audio models
                        ...(config.thinkingConfig && { thinkingConfig: config.thinkingConfig }),

                        // Session resumption
                        ...(config.sessionResumption && { sessionResumption: config.sessionResumption }),

                        // Context window compression
                        ...(config.contextWindowCompression && {
                            contextWindowCompression: config.contextWindowCompression
                        }),
                    },
                };

                this.logger.log(`   Sending setup message to Gemini...`);
                this.logger.debug(`   Setup: ${JSON.stringify(setupMessage, null, 2)}`);

                geminiWs.send(JSON.stringify(setupMessage));
            });

            // Handle messages from Gemini
            geminiWs.on('message', (data: WebSocket.Data) => {
                try {
                    const message = JSON.parse(data.toString());

                    // Log received message type
                    const msgType = Object.keys(message).filter(k => k !== 'usageMetadata')[0] || 'unknown';
                    this.logger.debug(`📨 Gemini message: ${msgType}`);

                    // Handle setupComplete
                    if (message.setupComplete !== undefined) {
                        session.isSetupComplete = true;
                        this.logger.log(`✅ Setup complete for client ${client.id}`);
                        client.emit('setupComplete', {});
                    }

                    // Handle serverContent (audio/text responses)
                    if (message.serverContent) {
                        const sc = message.serverContent;

                        // Forward full serverContent to client
                        client.emit('serverContent', {
                            modelTurn: sc.modelTurn,
                            turnComplete: sc.turnComplete,
                            interrupted: sc.interrupted,
                            generationComplete: sc.generationComplete,
                            groundingMetadata: sc.groundingMetadata,
                        });

                        // Also emit specific transcription events
                        if (sc.inputTranscription?.text) {
                            client.emit('inputTranscription', { text: sc.inputTranscription.text });
                        }
                        if (sc.outputTranscription?.text) {
                            client.emit('outputTranscription', { text: sc.outputTranscription.text });
                        }
                        if (sc.interrupted) {
                            client.emit('interrupted', {});
                        }
                        if (sc.turnComplete) {
                            client.emit('turnComplete', {});
                        }
                        if (sc.generationComplete) {
                            client.emit('generationComplete', {});
                        }
                    }

                    // Handle toolCall
                    if (message.toolCall) {
                        this.logger.log(`🔧 Tool call for client ${client.id}`);
                        client.emit('toolCall', message.toolCall);
                    }

                    // Handle toolCallCancellation
                    if (message.toolCallCancellation) {
                        client.emit('toolCallCancellation', message.toolCallCancellation);
                    }

                    // Handle goAway (session ending soon)
                    if (message.goAway) {
                        this.logger.warn(`⚠️ GoAway for client ${client.id}: ${message.goAway.timeLeft}`);
                        client.emit('goAway', { timeLeft: message.goAway.timeLeft });
                    }

                    // Handle sessionResumptionUpdate
                    if (message.sessionResumptionUpdate) {
                        session.sessionHandle = message.sessionResumptionUpdate.newHandle;
                        client.emit('sessionResumptionUpdate', {
                            newHandle: message.sessionResumptionUpdate.newHandle,
                            resumable: message.sessionResumptionUpdate.resumable,
                        });
                    }

                    // Handle usageMetadata
                    if (message.usageMetadata) {
                        client.emit('usageMetadata', message.usageMetadata);
                    }

                } catch (parseError) {
                    this.logger.error(`Failed to parse Gemini message: ${parseError}`);
                }
            });

            // Handle Gemini WebSocket close
            geminiWs.on('close', (code, reason) => {
                this.logger.log(`🔌 Gemini WebSocket closed for ${client.id}: ${code} - ${reason}`);
                session.isSetupComplete = false;
                session.geminiWs = null;
                client.emit('sessionClosed', { code, reason: reason?.toString() || 'Connection closed' });
            });

            // Handle Gemini WebSocket error
            geminiWs.on('error', (error) => {
                this.logger.error(`❌ Gemini WebSocket error for ${client.id}: ${error.message}`);
                client.emit('error', {
                    code: 'GEMINI_WS_ERROR',
                    message: error.message,
                });
            });

            // Store WebSocket in session
            session.geminiWs = geminiWs;
            session.model = modelName;

        } catch (error) {
            this.logger.error(`Setup failed for ${client.id}: ${error}`);
            client.emit('error', {
                code: 'SETUP_FAILED',
                message: error.message || 'Setup failed',
            });
        }
    }

    /**
     * Handle realtime input (audio, video, text)
     * 
     * BidiGenerateContentRealtimeInput format:
     * - audio: { data: base64, mimeType: "audio/pcm;rate=16000" }
     * - video: { data: base64, mimeType: "image/jpeg" }
     * - text: string
     * - activityStart: {} (when VAD disabled)
     * - activityEnd: {} (when VAD disabled)
     * - audioStreamEnd: true (when mic paused)
     */
    @SubscribeMessage('realtimeInput')
    handleRealtimeInput(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: any,
    ) {
        const session = this.sessions.get(client.id);

        if (!session?.geminiWs || session.geminiWs.readyState !== WebSocket.OPEN) {
            client.emit('error', {
                code: 'NOT_CONNECTED',
                message: 'Not connected to Gemini',
            });
            return;
        }

        if (!session.isSetupComplete) {
            client.emit('error', {
                code: 'SETUP_NOT_COMPLETE',
                message: 'Setup not complete. Wait for setupComplete event.',
            });
            return;
        }

        try {
            // Extract input data - handle both wrapped and direct formats
            const input = payload.realtimeInput || payload;

            // Build message per BidiGenerateContentRealtimeInput spec
            // Uses mediaChunks array for audio/video data
            const message: any = { realtimeInput: {} };

            // Audio input - using mediaChunks format (correct per Gemini API spec)
            if (input.audio) {
                message.realtimeInput.mediaChunks = [{
                    mimeType: input.audio.mimeType || 'audio/pcm;rate=16000',
                    data: input.audio.data,
                }];
            }

            // Video input - using mediaChunks format
            if (input.video) {
                message.realtimeInput.mediaChunks = message.realtimeInput.mediaChunks || [];
                message.realtimeInput.mediaChunks.push({
                    mimeType: input.video.mimeType || 'image/jpeg',
                    data: input.video.data,
                });
            }

            // Text input - direct format
            if (input.text) {
                message.realtimeInput.text = input.text;
            }

            // Activity signals (when manual VAD)
            if (input.activityStart) {
                message.realtimeInput.activityStart = {};
            }
            if (input.activityEnd) {
                message.realtimeInput.activityEnd = {};
            }

            // Audio stream end (when mic paused)
            if (input.audioStreamEnd) {
                message.realtimeInput.audioStreamEnd = true;
            }

            session.geminiWs.send(JSON.stringify(message));

        } catch (error) {
            this.logger.error(`Failed to send realtimeInput: ${error}`);
            client.emit('error', {
                code: 'SEND_FAILED',
                message: 'Failed to send input',
            });
        }
    }

    /**
     * Handle audio stream end signal
     */
    @SubscribeMessage('audioStreamEnd')
    handleAudioStreamEnd(@ConnectedSocket() client: Socket) {
        const session = this.sessions.get(client.id);

        if (!session?.geminiWs || session.geminiWs.readyState !== WebSocket.OPEN) {
            return;
        }

        try {
            const message = {
                realtimeInput: {
                    audioStreamEnd: true,
                },
            };
            session.geminiWs.send(JSON.stringify(message));
            this.logger.debug(`Audio stream end sent for ${client.id}`);
        } catch (error) {
            this.logger.error(`Failed to send audioStreamEnd: ${error}`);
        }
    }

    /**
     * Handle client content (text messages, conversation turns)
     * 
     * BidiGenerateContentClientContent format:
     * - turns: array of content turns or simple string
     * - turnComplete: boolean
     */
    @SubscribeMessage('clientContent')
    handleClientContent(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: any,
    ) {
        const session = this.sessions.get(client.id);

        if (!session?.geminiWs || session.geminiWs.readyState !== WebSocket.OPEN) {
            client.emit('error', {
                code: 'NOT_CONNECTED',
                message: 'Not connected to Gemini',
            });
            return;
        }

        if (!session.isSetupComplete) {
            client.emit('error', {
                code: 'SETUP_NOT_COMPLETE',
                message: 'Setup not complete',
            });
            return;
        }

        try {
            let message: any;

            // Handle different input formats
            if (payload.clientContent) {
                message = { clientContent: payload.clientContent };
            } else if (typeof payload.turns === 'string') {
                // Simple text message
                message = {
                    clientContent: {
                        turns: payload.turns,
                        turnComplete: payload.turnComplete ?? true,
                    },
                };
            } else {
                message = { clientContent: payload };
            }

            this.logger.debug(`Sending clientContent for ${client.id}`);
            session.geminiWs.send(JSON.stringify(message));

        } catch (error) {
            this.logger.error(`Failed to send clientContent: ${error}`);
            client.emit('error', {
                code: 'SEND_FAILED',
                message: 'Failed to send content',
            });
        }
    }

    /**
     * Handle tool response
     * 
     * BidiGenerateContentToolResponse format:
     * - functionResponses: array of { id, name, response }
     */
    @SubscribeMessage('toolResponse')
    handleToolResponse(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: any,
    ) {
        const session = this.sessions.get(client.id);

        if (!session?.geminiWs || session.geminiWs.readyState !== WebSocket.OPEN) {
            client.emit('error', {
                code: 'NOT_CONNECTED',
                message: 'Not connected to Gemini',
            });
            return;
        }

        try {
            const response = payload.toolResponse || payload;

            const message = {
                toolResponse: {
                    functionResponses: response.functionResponses,
                },
            };

            this.logger.log(`Sending tool response for ${client.id}`);
            session.geminiWs.send(JSON.stringify(message));

        } catch (error) {
            this.logger.error(`Failed to send toolResponse: ${error}`);
            client.emit('error', {
                code: 'SEND_FAILED',
                message: 'Failed to send tool response',
            });
        }
    }

    /**
     * Get session status
     */
    @SubscribeMessage('getStatus')
    handleGetStatus(@ConnectedSocket() client: Socket) {
        const session = this.sessions.get(client.id);

        client.emit('status', {
            connected: session?.geminiWs?.readyState === WebSocket.OPEN,
            setupComplete: session?.isSetupComplete || false,
            model: session?.model,
            sessionHandle: session?.sessionHandle,
        });
    }
}
