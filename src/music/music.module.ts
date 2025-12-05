import { Module } from '@nestjs/common';
import { MusicController } from './music.controller';
import { VertexAiModule } from '../vertex-ai/vertex-ai.module';

/**
 * Music Module
 * Provides Lyria music generation endpoints for API v1
 */
@Module({
    imports: [VertexAiModule],
    controllers: [MusicController],
})
export class MusicModule { }
