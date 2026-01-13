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
 * Live API Configuration - BidiGenerateContentSetup
 * Based on Google's Live API WebSocket specification
 */
interface LiveApiSetupConfig {
    model: string;
    generationConfig?: {
        responseModalities?: ('TEXT' | 'AUDIO')[];
        speechConfig?: {
            voiceConfig?: {
                prebuiltVoiceConfig?: { voiceName: string };
            };
            languageCode?: string;
        };
        temperature?: number;
        topP?: number;
        topK?: number;
        maxOutputTokens?: number;
    };
    systemInstruction?: {
        parts: Array<{ text: string }>;
    };
    tools?: Array<{
        functionDeclarations?: Array<{
            name: string;
            description?: string;
            parameters?: Record<string, unknown>;
        }>;
        googleSearch?: Record<string, unknown>;
    }>;
    // Audio transcription config
    inputAudioTranscription?: Record<string, unknown>;
    outputAudioTranscription?: Record<string, unknown>;
    // Realtime input config with VAD
    realtimeInputConfig?: {
        automaticActivityDetection?: {
            disabled?: boolean;
            startOfSpeechSensitivity?: 'START_SENSITIVITY_HIGH' | 'START_SENSITIVITY_LOW';
            endOfSpeechSensitivity?: 'END_SENSITIVITY_HIGH' | 'END_SENSITIVITY_LOW';
            prefixPaddingMs?: number;
            silenceDurationMs?: number;
        };
        activityHandling?: 'START_OF_ACTIVITY_INTERRUPTS' | 'NO_INTERRUPTION';
        turnCoverage?: 'TURN_INCLUDES_ONLY_ACTIVITY' | 'TURN_INCLUDES_ALL_INPUT';
    };
    // Thinking config for native audio models
    thinkingConfig?: {
        thinkingBudget?: number;
        includeThoughts?: boolean;
    };
    // Session resumption
    sessionResumption?: {
        handle?: string;
    };
    // Context window compression
    contextWindowCompression?: {
        slidingWindow?: Record<string, unknown>;
        triggerTokens?: number;
    };
    // Proactivity config
    proactivity?: {
        proactiveAudio?: boolean;
    };
    // Affective dialog
    enableAffectiveDialog?: boolean;
}

/**
 * Realtime Input Message - BidiGenerateContentRealtimeInput
 */
interface RealtimeInput {
    audio?: {
        data: string;
        mimeType: string;
    };
    video?: {
        data: string;
        mimeType: string;
    };
    text?: string;
    activityStart?: Record<string, unknown>;
    activityEnd?: Record<string, unknown>;
    audioStreamEnd?: boolean;
}

/**
 * Client Content Message - BidiGenerateContentClientContent
 */
interface ClientContent {
    turns?: Array<{
        role: 'user' | 'model';
        parts: Array<{
            text?: string;
            inlineData?: {
                mimeType: string;
                data: string;
            };
        }>;
    }>;
    turnComplete?: boolean;
}

/**
 * Tool Response Message - BidiGenerateContentToolResponse
 */
interface ToolResponse {
    functionResponses: Array<{
        id: string;
        name: string;
        response: Record<string, unknown>;
    }>;
}

/**
 * Session State
 */
interface SessionState {
    geminiWs: WebSocket | null;
    model: string;
    isSetupComplete: boolean;
    userId?: string;
    sessionHandle?: string;
}

/**
 * Live API WebSocket Gateway
 * Provides real-time bidirectional audio/video/text communication with Gemini
 * 
 * Features:
 * - Bidirectional audio streaming (16kHz input, 24kHz output)
 * - Voice Activity Detection (VAD)
 * - Audio transcription (input and output)
 * - Thinking mode support
 * - Session management and resumption
 * - Tool/function calling
 * 
 * Usage:
 * 1. Connect to ws://localhost:3001/live
 * 2. Send setup message with model config
 * 3. Send realtimeInput messages with audio data
 * 4. Receive serverContent responses with audio/text
 */
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
    private readonly geminiWsUrl = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

    constructor(private readonly configService: ConfigService) {
        this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
        if (!this.geminiApiKey) {
            this.logger.warn('GEMINI_API_KEY not configured - Live API will not work');
        } else {
            this.logger.log('Live API Gateway initialized with Gemini Live API support');
        }
    }

    /**
     * Handle new client connection
     */
    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);

        // Initialize session state
        this.sessions.set(client.id, {
            geminiWs: null,
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            isSetupComplete: false,
        });

        // Send connection acknowledgment
        client.emit('connected', {
            message: 'Connected to Live API',
            sessionId: client.id,
            supportedModels: [
                'gemini-2.5-flash-native-audio-preview-12-2025',
                'gemini-live-2.5-flash-preview',
            ],
        });
    }

    /**
     * Handle client disconnect
     */
    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        // Clean up Gemini WebSocket connection
        const session = this.sessions.get(client.id);
        if (session?.geminiWs) {
            session.geminiWs.close();
        }
        this.sessions.delete(client.id);
    }

    /**
     * Handle setup message - initializes Gemini connection
     * BidiGenerateContentSetup
     */
    @SubscribeMessage('setup')
    async handleSetup(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { setup: LiveApiSetupConfig },
    ) {
        const config = payload.setup;
        const session = this.sessions.get(client.id);
        if (!session) {
            client.emit('error', { code: 'SESSION_NOT_FOUND', message: 'Session not found' });
            return;
        }

        if (!this.geminiApiKey) {
            client.emit('error', { code: 'API_KEY_MISSING', message: 'API key not configured' });
            return;
        }

        try {
            this.logger.log(`Setting up Live API for client ${client.id} with model ${config.model}`);

            // Close existing connection if any
            if (session.geminiWs) {
                session.geminiWs.close();
            }

            // Create WebSocket connection to Gemini
            const wsUrl = `${this.geminiWsUrl}?key=${this.geminiApiKey}`;
            const geminiWs = new WebSocket(wsUrl);

            // Handle Gemini WebSocket events
            geminiWs.on('open', () => {
                this.logger.log(`Gemini WebSocket opened for client ${client.id}`);

                // Build the setup message following Google's API spec
                const setupMessage = {
                    setup: {
                        model: config.model.startsWith('models/') ? config.model : `models/${config.model}`,
                        generationConfig: {
                            responseModalities: config.generationConfig?.responseModalities || ['AUDIO'],
                            speechConfig: config.generationConfig?.speechConfig || {
                                voiceConfig: {
                                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                                },
                            },
                            temperature: config.generationConfig?.temperature ?? 0.7,
                            maxOutputTokens: config.generationConfig?.maxOutputTokens ?? 4096,
                        },
                        systemInstruction: config.systemInstruction,
                        tools: config.tools,
                        // Enable audio transcription by default
                        inputAudioTranscription: config.inputAudioTranscription || {},
                        outputAudioTranscription: config.outputAudioTranscription || {},
                        // VAD configuration
                        realtimeInputConfig: config.realtimeInputConfig || {
                            automaticActivityDetection: {
                                disabled: false,
                                startOfSpeechSensitivity: 'START_SENSITIVITY_HIGH',
                                endOfSpeechSensitivity: 'END_SENSITIVITY_HIGH',
                            },
                        },
                        // Thinking config for native audio models
                        thinkingConfig: config.thinkingConfig,
                        // Session resumption
                        sessionResumption: config.sessionResumption,
                        // Context compression
                        contextWindowCompression: config.contextWindowCompression,
                        // Proactivity
                        proactivity: config.proactivity,
                        // Affective dialog
                        enableAffectiveDialog: config.enableAffectiveDialog,
                    },
                };

                geminiWs.send(JSON.stringify(setupMessage));
            });

            geminiWs.on('message', (data: WebSocket.Data) => {
                try {
                    const message = JSON.parse(data.toString());

                    // Handle different message types
                    if (message.setupComplete !== undefined) {
                        session.isSetupComplete = true;
                        client.emit('setupComplete', {});
                        this.logger.log(`Setup complete for client ${client.id}`);
                    }

                    if (message.serverContent) {
                        const serverContent = message.serverContent;

                        // Emit the full serverContent for full control on frontend
                        client.emit('serverContent', {
                            modelTurn: serverContent.modelTurn,
                            turnComplete: serverContent.turnComplete,
                            interrupted: serverContent.interrupted,
                            generationComplete: serverContent.generationComplete,
                            groundingMetadata: serverContent.groundingMetadata,
                        });

                        // Also emit specific events for convenience
                        if (serverContent.inputTranscription) {
                            client.emit('inputTranscription', {
                                text: serverContent.inputTranscription.text,
                            });
                        }

                        if (serverContent.outputTranscription) {
                            client.emit('outputTranscription', {
                                text: serverContent.outputTranscription.text,
                            });
                        }

                        if (serverContent.interrupted) {
                            client.emit('interrupted', {});
                        }

                        if (serverContent.generationComplete) {
                            client.emit('generationComplete', {});
                        }

                        if (serverContent.turnComplete) {
                            client.emit('turnComplete', {});
                        }
                    }

                    if (message.toolCall) {
                        client.emit('toolCall', message.toolCall);
                    }

                    if (message.toolCallCancellation) {
                        client.emit('toolCallCancellation', message.toolCallCancellation);
                    }

                    if (message.goAway) {
                        client.emit('goAway', {
                            timeLeft: message.goAway.timeLeft,
                        });
                        this.logger.log(`GoAway received for client ${client.id}, time left: ${message.goAway.timeLeft}`);
                    }

                    if (message.sessionResumptionUpdate) {
                        session.sessionHandle = message.sessionResumptionUpdate.newHandle;
                        client.emit('sessionResumptionUpdate', {
                            newHandle: message.sessionResumptionUpdate.newHandle,
                            resumable: message.sessionResumptionUpdate.resumable,
                        });
                    }

                    if (message.usageMetadata) {
                        client.emit('usageMetadata', message.usageMetadata);
                    }

                } catch (parseError) {
                    this.logger.error('Failed to parse Gemini message:', parseError);
                }
            });

            geminiWs.on('close', (code, reason) => {
                this.logger.log(`Gemini WebSocket closed for client ${client.id}: ${code} - ${reason}`);
                session.isSetupComplete = false;
                client.emit('sessionClosed', {
                    code,
                    reason: reason?.toString() || 'Connection closed',
                });
            });

            geminiWs.on('error', (error) => {
                this.logger.error(`Gemini WebSocket error for client ${client.id}:`, error);
                client.emit('error', {
                    code: 'GEMINI_WS_ERROR',
                    message: 'Connection error',
                    details: error.message,
                });
            });

            // Update session
            session.geminiWs = geminiWs;
            session.model = config.model;

        } catch (error) {
            this.logger.error('Setup failed:', error);
            client.emit('error', {
                code: 'SETUP_FAILED',
                message: 'Setup failed',
                details: error.message,
            });
        }
    }

    /**
     * Handle realtime input (audio, video, text)
     * BidiGenerateContentRealtimeInput
     */
    @SubscribeMessage('realtimeInput')
    handleRealtimeInput(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { realtimeInput: RealtimeInput } | RealtimeInput,
    ) {
        const session = this.sessions.get(client.id);

        if (!session?.geminiWs || !session.isSetupComplete) {
            client.emit('error', {
                code: 'SESSION_NOT_READY',
                message: 'Session not ready. Send setup first.',
            });
            return;
        }

        try {
            // Handle both wrapped and unwrapped formats
            const input = 'realtimeInput' in payload ? payload.realtimeInput : payload;

            // Build the message according to Google's spec
            const message: Record<string, unknown> = {
                realtimeInput: {},
            };

            // Audio input
            if (input.audio) {
                (message.realtimeInput as Record<string, unknown>).audio = {
                    data: input.audio.data,
                    mimeType: input.audio.mimeType || 'audio/pcm;rate=16000',
                };
            }

            // Video input
            if (input.video) {
                (message.realtimeInput as Record<string, unknown>).video = {
                    data: input.video.data,
                    mimeType: input.video.mimeType,
                };
            }

            // Text input
            if (input.text) {
                (message.realtimeInput as Record<string, unknown>).text = input.text;
            }

            // Activity signals (when VAD is disabled)
            if (input.activityStart) {
                (message.realtimeInput as Record<string, unknown>).activityStart = {};
            }
            if (input.activityEnd) {
                (message.realtimeInput as Record<string, unknown>).activityEnd = {};
            }

            // Audio stream end (when pausing mic)
            if (input.audioStreamEnd) {
                (message.realtimeInput as Record<string, unknown>).audioStreamEnd = true;
            }

            session.geminiWs.send(JSON.stringify(message));
        } catch (error) {
            this.logger.error('Failed to send realtime input:', error);
            client.emit('error', {
                code: 'INPUT_SEND_FAILED',
                message: 'Failed to send input',
            });
        }
    }

    /**
     * Handle audio stream end (when mic is paused/stopped)
     */
    @SubscribeMessage('audioStreamEnd')
    handleAudioStreamEnd(@ConnectedSocket() client: Socket) {
        const session = this.sessions.get(client.id);

        if (!session?.geminiWs || !session.isSetupComplete) {
            return;
        }

        try {
            const message = {
                realtimeInput: {
                    audioStreamEnd: true,
                },
            };
            session.geminiWs.send(JSON.stringify(message));
        } catch (error) {
            this.logger.error('Failed to send audioStreamEnd:', error);
        }
    }

    /**
     * Handle tool response
     * BidiGenerateContentToolResponse
     */
    @SubscribeMessage('toolResponse')
    handleToolResponse(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { toolResponse: ToolResponse } | ToolResponse,
    ) {
        const session = this.sessions.get(client.id);

        if (!session?.geminiWs || !session.isSetupComplete) {
            client.emit('error', {
                code: 'SESSION_NOT_READY',
                message: 'Session not ready.',
            });
            return;
        }

        try {
            // Handle both wrapped and unwrapped formats
            const response = 'toolResponse' in payload ? payload.toolResponse : payload;

            const message = {
                toolResponse: {
                    functionResponses: response.functionResponses,
                },
            };
            session.geminiWs.send(JSON.stringify(message));
        } catch (error) {
            this.logger.error('Failed to send tool response:', error);
            client.emit('error', {
                code: 'TOOL_RESPONSE_FAILED',
                message: 'Failed to send tool response',
            });
        }
    }

    /**
     * Handle client content (text messages, conversation history)
     * BidiGenerateContentClientContent
     */
    @SubscribeMessage('clientContent')
    handleClientContent(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { clientContent: ClientContent } | ClientContent | { turns: string; turnComplete?: boolean },
    ) {
        const session = this.sessions.get(client.id);

        if (!session?.geminiWs || !session.isSetupComplete) {
            client.emit('error', {
                code: 'SESSION_NOT_READY',
                message: 'Session not ready.',
            });
            return;
        }

        try {
            let message: Record<string, unknown>;

            // Handle various input formats
            if ('clientContent' in payload) {
                message = { clientContent: payload.clientContent };
            } else if ('turns' in payload && typeof payload.turns === 'string') {
                // Simple text input format
                message = {
                    clientContent: {
                        turns: payload.turns,
                        turnComplete: payload.turnComplete ?? true,
                    },
                };
            } else if ('parts' in payload) {
                // Legacy format with parts
                message = {
                    clientContent: {
                        turns: [{ role: 'user', parts: (payload as { parts: Array<{ text: string }> }).parts }],
                        turnComplete: true,
                    },
                };
            } else {
                message = { clientContent: payload };
            }

            session.geminiWs.send(JSON.stringify(message));
        } catch (error) {
            this.logger.error('Failed to send client content:', error);
            client.emit('error', {
                code: 'CONTENT_SEND_FAILED',
                message: 'Failed to send content',
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
            connected: !!session?.geminiWs,
            setupComplete: session?.isSetupComplete || false,
            model: session?.model,
            sessionHandle: session?.sessionHandle,
        });
    }
}
