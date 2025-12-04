import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { VertexAiModule } from '../vertex-ai/vertex-ai.module';

/**
 * Chat Module
 * Provides chat functionality using Vertex AI
 */
@Module({
    imports: [VertexAiModule],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService],
})
export class ChatModule { }
