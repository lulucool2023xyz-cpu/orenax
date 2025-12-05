import { Module } from '@nestjs/common';
import { AudioController } from './audio.controller';
import { VertexAiModule } from '../vertex-ai/vertex-ai.module';

/**
 * Audio Module
 * Provides TTS endpoints for API v1
 */
@Module({
    imports: [VertexAiModule],
    controllers: [AudioController],
})
export class AudioModule { }
