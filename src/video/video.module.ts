import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VertexAiModule } from '../vertex-ai/vertex-ai.module';

/**
 * Video Module
 * Provides video generation endpoints for API v1
 */
@Module({
    imports: [VertexAiModule],
    controllers: [VideoController],
})
export class VideoModule { }
