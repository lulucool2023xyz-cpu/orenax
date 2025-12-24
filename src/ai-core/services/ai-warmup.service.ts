import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { AiConfigService } from '../config/ai-config.service';

/**
 * AI Warmup Service
 * Initializes AI clients on application bootstrap to reduce cold-start latency
 */
@Injectable()
export class AiWarmupService implements OnApplicationBootstrap {
    private readonly logger = new Logger(AiWarmupService.name);

    constructor(private readonly aiConfig: AiConfigService) { }

    async onApplicationBootstrap() {
        this.logger.log('🔥 Warming up AI clients...');

        try {
            // Try to initialize Gemini client
            try {
                const client = this.aiConfig.getGeminiClient();
                if (client) {
                    this.logger.log('✅ Gemini API client initialized');
                }
            } catch (e) {
                this.logger.warn(`⚠️ Gemini API not configured: ${e.message}`);
            }

            // Check Vertex AI configuration
            try {
                const vertexConfig = this.aiConfig.getVertexConfig();
                if (vertexConfig.projectId) {
                    this.logger.log('✅ Vertex AI configuration loaded');
                }
            } catch (e) {
                this.logger.warn(`⚠️ Vertex AI not configured: ${e.message}`);
            }

            this.logger.log('🚀 AI clients warmup complete');
        } catch (error) {
            this.logger.warn(`⚠️ AI warmup failed: ${error.message}`);
            // Don't throw - warmup failure shouldn't prevent app from starting
        }
    }
}
