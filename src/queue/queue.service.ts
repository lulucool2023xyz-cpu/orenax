/**
 * Queue Service
 * Add jobs to queues and manage job lifecycle
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { QUEUE_NAMES } from './queue.module';

// Job data types
export interface AiGenerationJobData {
    type: 'chat' | 'vision' | 'audio' | 'function_calling';
    userId: string;
    model: string;
    messages: any[];
    options?: Record<string, any>;
    priority?: 'high' | 'normal' | 'low';
}

export interface MediaProcessingJobData {
    type: 'image' | 'video' | 'audio';
    userId: string;
    sourceUrl: string;
    operation: string;
    options?: Record<string, any>;
}

export type JobResult = {
    success: boolean;
    data?: any;
    error?: string;
};

// Priority mapping
const PRIORITY_MAP = {
    high: 1,
    normal: 5,
    low: 10,
};

@Injectable()
export class QueueService {
    private readonly logger = new Logger(QueueService.name);

    constructor(
        @InjectQueue(QUEUE_NAMES.AI_GENERATION)
        private readonly aiQueue: Queue<AiGenerationJobData, JobResult>,
        @InjectQueue(QUEUE_NAMES.MEDIA_PROCESSING)
        private readonly mediaQueue: Queue<MediaProcessingJobData, JobResult>,
    ) { }

    /**
     * Add AI generation job to queue
     */
    async addAiGenerationJob(
        data: AiGenerationJobData,
        options?: { delay?: number }
    ): Promise<string> {
        const job = await this.aiQueue.add(
            `ai-${data.type}`,
            data,
            {
                priority: PRIORITY_MAP[data.priority || 'normal'],
                delay: options?.delay,
            }
        );

        this.logger.log(`Added AI job: ${job.id} (${data.type})`);
        return job.id!;
    }

    /**
     * Add media processing job
     */
    async addMediaProcessingJob(
        data: MediaProcessingJobData,
        options?: { delay?: number }
    ): Promise<string> {
        const job = await this.mediaQueue.add(
            `media-${data.type}`,
            data,
            {
                delay: options?.delay,
            }
        );

        this.logger.log(`Added media job: ${job.id} (${data.type})`);
        return job.id!;
    }

    /**
     * Get job by ID
     */
    async getAiJob(jobId: string): Promise<Job<AiGenerationJobData, JobResult> | null> {
        const job = await this.aiQueue.getJob(jobId);
        return job || null;
    }

    async getMediaJob(jobId: string): Promise<Job<MediaProcessingJobData, JobResult> | null> {
        const job = await this.mediaQueue.getJob(jobId);
        return job || null;
    }

    /**
     * Get queue statistics
     */
    async getQueueStats(queueName: 'ai' | 'media' = 'ai') {
        const queue = queueName === 'ai' ? this.aiQueue : this.mediaQueue;

        const [waiting, active, completed, failed, delayed] = await Promise.all([
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount(),
            queue.getDelayedCount(),
        ]);

        return {
            queueName,
            waiting,
            active,
            completed,
            failed,
            delayed,
            total: waiting + active + delayed,
        };
    }

    /**
     * Cancel a job
     */
    async cancelJob(queueName: 'ai' | 'media', jobId: string): Promise<boolean> {
        const queue = queueName === 'ai' ? this.aiQueue : this.mediaQueue;
        const job = await queue.getJob(jobId);

        if (!job) return false;

        const state = await job.getState();
        if (state === 'waiting' || state === 'delayed') {
            await job.remove();
            return true;
        }

        return false;
    }

    /**
     * Retry a failed job
     */
    async retryJob(queueName: 'ai' | 'media', jobId: string): Promise<boolean> {
        const queue = queueName === 'ai' ? this.aiQueue : this.mediaQueue;
        const job = await queue.getJob(jobId);

        if (!job) return false;

        const state = await job.getState();
        if (state === 'failed') {
            await job.retry();
            return true;
        }

        return false;
    }

    /**
     * Clean old jobs
     */
    async cleanOldJobs(olderThanMs: number = 86400000) { // 24 hours default
        await Promise.all([
            this.aiQueue.clean(olderThanMs, 1000, 'completed'),
            this.aiQueue.clean(olderThanMs, 100, 'failed'),
            this.mediaQueue.clean(olderThanMs, 1000, 'completed'),
            this.mediaQueue.clean(olderThanMs, 100, 'failed'),
        ]);
    }
}
