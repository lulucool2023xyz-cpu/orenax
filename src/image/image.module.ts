import { Module } from '@nestjs/common';
import { ImageController } from './image.controller';
import { VertexAiModule } from '../vertex-ai/vertex-ai.module';

/**
 * Image Module
 * Provides image generation, editing, and manipulation functionality using Vertex AI
 */
@Module({
    imports: [VertexAiModule],
    controllers: [ImageController],
})
export class ImageModule {}





