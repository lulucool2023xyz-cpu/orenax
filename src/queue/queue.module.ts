/**
 * Queue Module
 * BullMQ-based job queue for async AI operations
 */

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Processors
import { AiJobProcessor } from './processors/ai-job.processor';

// Services
import { QueueService } from './queue.service';
import { JobStatusService } from './job-status.service';

// Controller
import { QueueController } from './queue.controller';

// Queue names
import { QUEUE_NAMES } from './queue.constants';

export { QUEUE_NAMES };

@Module({
    imports: [
        // BullMQ configuration with Redis
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const redisUrl = configService.get<string>('REDIS_URL');

                if (!redisUrl) {
                    // Fallback for development without Redis
                    return {
                        connection: {
                            host: 'localhost',
                            port: 6379,
                        },
                    };
                }

                // Parse Redis URL
                const url = new URL(redisUrl);
                return {
                    connection: {
                        host: url.hostname,
                        port: parseInt(url.port) || 6379,
                        password: url.password || undefined,
                    },
                };
            },
        }),
        // Register queues
        BullModule.registerQueue({
            name: QUEUE_NAMES.AI_GENERATION,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
                removeOnComplete: 100, // Keep last 100 completed
                removeOnFail: 50,
            },
        }),
        BullModule.registerQueue({
            name: QUEUE_NAMES.MEDIA_PROCESSING,
            defaultJobOptions: {
                attempts: 2,
                backoff: {
                    type: 'fixed',
                    delay: 5000,
                },
            },
        }),
    ],
    providers: [
        AiJobProcessor,
        QueueService,
        JobStatusService,
    ],
    controllers: [QueueController],
    exports: [QueueService, JobStatusService],
})
export class QueueModule { }
