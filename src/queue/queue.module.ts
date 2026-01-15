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
import { getQueueToken } from '@nestjs/bullmq';

export { QUEUE_NAMES };

const redisUrl = process.env.REDIS_URL;
const isRedisAvailable = !!redisUrl;

if (!isRedisAvailable) {
    console.warn('⚠️  REDIS_URL not found. QueueModule will use MOCK queues. Async jobs will NOT be processed.');
}

// Mock Queue implementation
const createMockQueue = (name: string) => ({
    name,
    add: async () => ({ id: 'mock-job-id' }),
    getJob: async () => null,
    getWaitingCount: async () => 0,
    getActiveCount: async () => 0,
    getCompletedCount: async () => 0,
    getFailedCount: async () => 0,
    getDelayedCount: async () => 0,
    clean: async () => { },
});

@Module({
    imports: isRedisAvailable ? [
        // BullMQ configuration with Redis
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const redisUrl = configService.get<string>('REDIS_URL');
                if (!redisUrl) {
                    throw new Error('REDIS_URL is required for BullMQ');
                }
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
                backoff: { type: 'exponential', delay: 2000 },
                removeOnComplete: 100,
                removeOnFail: 50,
            },
        }),
        BullModule.registerQueue({
            name: QUEUE_NAMES.MEDIA_PROCESSING,
            defaultJobOptions: { attempts: 2, backoff: { type: 'fixed', delay: 5000 } },
        }),
    ] : [],
    providers: [
        AiJobProcessor,
        QueueService,
        JobStatusService,
        // Mock providers if Redis is missing
        ...(isRedisAvailable ? [] : [
            {
                provide: getQueueToken(QUEUE_NAMES.AI_GENERATION),
                useValue: createMockQueue(QUEUE_NAMES.AI_GENERATION),
            },
            {
                provide: getQueueToken(QUEUE_NAMES.MEDIA_PROCESSING),
                useValue: createMockQueue(QUEUE_NAMES.MEDIA_PROCESSING),
            },
        ]),
    ],
    controllers: [QueueController],
    exports: [QueueService, JobStatusService],
})
export class QueueModule { }
