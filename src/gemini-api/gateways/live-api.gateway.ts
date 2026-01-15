import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { LiveApiService } from '../services/live-api.service';

@WebSocketGateway({
    cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        credentials: true,
    },
})
export class LiveApiGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(LiveApiGateway.name);
    private readonly clients: Map<WebSocket, string> = new Map();
    private clientCounter = 0;

    constructor(private readonly liveApiService: LiveApiService) { }

    handleConnection(client: WebSocket) {
        const clientId = `client_${++this.clientCounter}_${Date.now()}`;
        this.clients.set(client, clientId);
        this.logger.log(`Client connected: ${clientId}`);

        this.sendToClient(client, {
            type: 'connected',
            data: { clientId },
        });
    }

    async handleDisconnect(client: WebSocket) {
        const clientId = this.clients.get(client);
        if (clientId) {
            this.logger.log(`Client disconnected: ${clientId}`);
            await this.liveApiService.closeSession(clientId);
            this.clients.delete(client);
        }
    }

    @SubscribeMessage('start-session')
    async handleStartSession(
        @ConnectedSocket() client: WebSocket,
        @MessageBody() data: { systemInstruction?: string } // Receive data
    ) {
        const clientId = this.clients.get(client);
        if (!clientId) {
            this.sendError(client, 'Client not registered');
            return;
        }

        this.logger.log(`Starting session for ${clientId}...`);

        try {
            await this.liveApiService.createSession(
                clientId,
                data?.systemInstruction, // Pass it
                // onMessage - handle all Live API messages
                (message: any) => this.handleLiveApiMessage(client, clientId, message),
                // onError
                (error: Error) => this.sendError(client, error.message),
                // onClose
                () => {
                    this.sendToClient(client, { type: 'session-closed', data: {} });
                },
            );

            this.sendToClient(client, {
                type: 'session-started',
                data: { clientId },
            });

            this.logger.log(`Session started for ${clientId}`);
        } catch (error) {
            this.logger.error(`Failed to start session for ${clientId}:`, error);
            this.sendError(client, 'Failed to start Live API session');
        }
    }

    @SubscribeMessage('send-audio')
    async handleSendAudio(
        @ConnectedSocket() client: WebSocket,
        @MessageBody() data: { audio: string; mimeType?: string },
    ) {
        const clientId = this.clients.get(client);
        if (!clientId || !this.liveApiService.hasSession(clientId)) {
            return;
        }

        try {
            await this.liveApiService.sendAudio(
                clientId,
                data.audio,
                data.mimeType || 'audio/pcm;rate=16000',
            );
        } catch (error) {
            this.logger.error(`Error sending audio: ${error.message}`);
        }
    }

    @SubscribeMessage('send-video')
    async handleSendVideo(
        @ConnectedSocket() client: WebSocket,
        @MessageBody() data: { video: string; mimeType?: string },
    ) {
        const clientId = this.clients.get(client);
        if (!clientId || !this.liveApiService.hasSession(clientId)) {
            return;
        }

        try {
            await this.liveApiService.sendVideo(
                clientId,
                data.video,
                data.mimeType || 'image/jpeg',
            );
        } catch (error) {
            this.logger.error(`Error sending video: ${error.message}`);
        }
    }

    @SubscribeMessage('send-text')
    async handleSendText(
        @ConnectedSocket() client: WebSocket,
        @MessageBody() data: { text: string },
    ) {
        const clientId = this.clients.get(client);
        if (!clientId || !this.liveApiService.hasSession(clientId)) {
            return;
        }

        try {
            await this.liveApiService.sendText(clientId, data.text);
        } catch (error) {
            this.logger.error(`Error sending text: ${error.message}`);
        }
    }

    @SubscribeMessage('end-session')
    async handleEndSession(@ConnectedSocket() client: WebSocket) {
        const clientId = this.clients.get(client);
        if (!clientId) return;

        await this.liveApiService.closeSession(clientId);
        this.sendToClient(client, {
            type: 'session-ended',
            data: { clientId },
        });
    }

    private handleLiveApiMessage(client: WebSocket, clientId: string, message: any) {
        // Handle setupComplete
        if (message.setupComplete) {
            this.logger.log(`[${clientId}] Setup complete`);
            this.sendToClient(client, { type: 'setup-complete', data: {} });
            return;
        }

        // Handle serverContent
        if (message.serverContent) {
            const sc = message.serverContent;

            // Audio response from model
            if (sc.modelTurn?.parts) {
                for (const part of sc.modelTurn.parts) {
                    if (part.inlineData?.data) {
                        this.logger.log(`[${clientId}] Sending audio chunk, size: ${part.inlineData.data.length}`);
                        this.sendToClient(client, {
                            type: 'audio-response',
                            data: {
                                audio: part.inlineData.data,
                                mimeType: part.inlineData.mimeType || 'audio/pcm;rate=24000',
                            },
                        });
                    }
                    if (part.text) {
                        this.sendToClient(client, {
                            type: 'text-response',
                            data: { text: part.text },
                        });
                    }
                }
            }

            // Input transcription (what user said)
            if (sc.inputTranscription?.text) {
                this.logger.log(`[${clientId}] User said: "${sc.inputTranscription.text}"`);
                this.sendToClient(client, {
                    type: 'input-transcription',
                    data: { text: sc.inputTranscription.text },
                });
            }

            // Output transcription (what AI said)
            if (sc.outputTranscription?.text) {
                this.logger.log(`[${clientId}] AI said: "${sc.outputTranscription.text}"`);
                this.sendToClient(client, {
                    type: 'output-transcription',
                    data: { text: sc.outputTranscription.text },
                });
            }

            // Turn complete
            if (sc.turnComplete) {
                this.logger.log(`[${clientId}] Turn complete`);
                this.sendToClient(client, { type: 'turn-complete', data: {} });
            }

            // Interrupted
            if (sc.interrupted) {
                this.logger.log(`[${clientId}] Interrupted`);
                this.sendToClient(client, { type: 'interrupted', data: {} });
            }
        }

        // Usage metadata
        if (message.usageMetadata) {
            this.sendToClient(client, {
                type: 'usage-metadata',
                data: message.usageMetadata,
            });
        }
    }

    private sendToClient(client: WebSocket, message: object) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    }

    private sendError(client: WebSocket, message: string) {
        this.sendToClient(client, { type: 'error', data: { message } });
    }
}
