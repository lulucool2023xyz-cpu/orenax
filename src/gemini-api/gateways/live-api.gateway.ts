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
 * Live API Configuration
 */
interface LiveApiSetup {
    model: string;
    generationConfig?: {
        responseModalities?: string[];
        speechConfig?: {
            voiceConfig?: {
                prebuiltVoiceConfig?: { voiceName: string };
            };
        };
    };
    systemInstruction?: {
        parts: Array<{ text: string }>;
    };
}

/**
 * Realtime Input Message
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
}

/**
 * Tool Response Message
 */
interface ToolResponse {
    functionResponses: Array<{
        name: string;
        response: any;
        id: string;
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
}

/**
 * Live API WebSocket Gateway
 * Provides real-time bidirectional audio/video/text communication with Gemini
 * 
 * Usage:
 * 1. Connect to ws://localhost:3001/live
 * 2. Send setup message with model config
 * 3. Send realtimeInput messages
 * 4. Receive serverContent responses
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
            this.logger.log('Live API Gateway initialized');
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
            model: 'gemini-2.5-flash-native-audio-preview',
            isSetupComplete: false,
        });

        // Send connection acknowledgment
        client.emit('connected', {
            message: 'Connected to Live API',
            sessionId: client.id,
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
     */
    @SubscribeMessage('setup')
    async handleSetup(
        @ConnectedSocket() client: Socket,
        @MessageBody() config: LiveApiSetup,
    ) {
        const session = this.sessions.get(client.id);
        if (!session) {
            client.emit('error', { message: 'Session not found' });
            return;
        }

        if (!this.geminiApiKey) {
            client.emit('error', { message: 'API key not configured' });
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

                // Send setup message to Gemini
                const setupMessage = {
                    setup: {
                        model: `models/${config.model}`,
                        generationConfig: config.generationConfig || {
                            responseModalities: ['AUDIO'],
                        },
                        systemInstruction: config.systemInstruction,
                    },
                };

                geminiWs.send(JSON.stringify(setupMessage));
            });

            geminiWs.on('message', (data: WebSocket.Data) => {
                try {
                    const message = JSON.parse(data.toString());

                    if (message.setupComplete) {
                        session.isSetupComplete = true;
                        client.emit('setupComplete', {});
                        this.logger.log(`Setup complete for client ${client.id}`);
                    } else if (message.serverContent) {
                        client.emit('serverContent', message.serverContent);
                    } else if (message.toolCall) {
                        client.emit('toolCall', message.toolCall);
                    } else if (message.error) {
                        client.emit('error', message.error);
                    }
                } catch (parseError) {
                    this.logger.error('Failed to parse Gemini message:', parseError);
                }
            });

            geminiWs.on('close', () => {
                this.logger.log(`Gemini WebSocket closed for client ${client.id}`);
                session.isSetupComplete = false;
                client.emit('sessionClosed', { message: 'Gemini session closed' });
            });

            geminiWs.on('error', (error) => {
                this.logger.error(`Gemini WebSocket error for client ${client.id}:`, error);
                client.emit('error', { message: 'Connection error', details: error.message });
            });

            // Update session
            session.geminiWs = geminiWs;
            session.model = config.model;

        } catch (error) {
            this.logger.error('Setup failed:', error);
            client.emit('error', { message: 'Setup failed', details: error.message });
        }
    }

    /**
     * Handle realtime input (audio, video, text)
     */
    @SubscribeMessage('realtimeInput')
    handleRealtimeInput(
        @ConnectedSocket() client: Socket,
        @MessageBody() input: RealtimeInput,
    ) {
        const session = this.sessions.get(client.id);

        if (!session?.geminiWs || !session.isSetupComplete) {
            client.emit('error', { message: 'Session not ready. Send setup first.' });
            return;
        }

        try {
            // Forward input to Gemini
            const message = { realtimeInput: input };
            session.geminiWs.send(JSON.stringify(message));
        } catch (error) {
            this.logger.error('Failed to send realtime input:', error);
            client.emit('error', { message: 'Failed to send input' });
        }
    }

    /**
     * Handle tool response
     */
    @SubscribeMessage('toolResponse')
    handleToolResponse(
        @ConnectedSocket() client: Socket,
        @MessageBody() response: ToolResponse,
    ) {
        const session = this.sessions.get(client.id);

        if (!session?.geminiWs || !session.isSetupComplete) {
            client.emit('error', { message: 'Session not ready.' });
            return;
        }

        try {
            const message = { toolResponse: response };
            session.geminiWs.send(JSON.stringify(message));
        } catch (error) {
            this.logger.error('Failed to send tool response:', error);
            client.emit('error', { message: 'Failed to send tool response' });
        }
    }

    /**
     * Handle client content (text messages)
     */
    @SubscribeMessage('clientContent')
    handleClientContent(
        @ConnectedSocket() client: Socket,
        @MessageBody() content: { parts: Array<{ text: string }> },
    ) {
        const session = this.sessions.get(client.id);

        if (!session?.geminiWs || !session.isSetupComplete) {
            client.emit('error', { message: 'Session not ready.' });
            return;
        }

        try {
            const message = {
                clientContent: {
                    turns: [{ role: 'user', parts: content.parts }],
                    turnComplete: true,
                },
            };
            session.geminiWs.send(JSON.stringify(message));
        } catch (error) {
            this.logger.error('Failed to send client content:', error);
            client.emit('error', { message: 'Failed to send content' });
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
        });
    }
}
