/**
 * Job Status Service
 * Track and report job status to clients
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { QUEUE_NAMES } from './queue.module';

export interface JobStatus {
    jobId: string;
    status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'unknown';
    progress: number;
    result?: any;
    error?: string;
    createdAt: Date;
    processedAt?: Date;
    finishedAt?: Date;
    attemptsMade: number;
}

@Injectable()
export class JobStatusService {
    private readonly logger = new Logger(JobStatusService.name);

    constructor(
        @InjectQueue(QUEUE_NAMES.AI_GENERATION)
        private readonly aiQueue: Queue,
        @InjectQueue(QUEUE_NAMES.MEDIA_PROCESSING)
        private readonly mediaQueue: Queue,
    ) { }

    /**
     * Get job status by ID
     */
    async getJobStatus(queueName: 'ai' | 'media', jobId: string): Promise<JobStatus | null> {
        const queue = queueName === 'ai' ? this.aiQueue : this.mediaQueue;
        const job = await queue.getJob(jobId);

        if (!job) {
            return null;
        }

        return this.mapJobToStatus(job);
    }

    /**
     * Get multiple job statuses
     */
    async getJobStatuses(
        queueName: 'ai' | 'media',
        jobIds: string[]
    ): Promise<Map<string, JobStatus | null>> {
        const results = new Map<string, JobStatus | null>();

        await Promise.all(
            jobIds.map(async (jobId) => {
                const status = await this.getJobStatus(queueName, jobId);
                results.set(jobId, status);
            })
        );

        return results;
    }

    /**
     * Get jobs by user
     */
    async getUserJobs(
        queueName: 'ai' | 'media',
        userId: string,
        limit: number = 20
    ): Promise<JobStatus[]> {
        const queue = queueName === 'ai' ? this.aiQueue : this.mediaQueue;

        // Get jobs in various states
        const [waiting, active, completed, failed] = await Promise.all([
            queue.getWaiting(0, 50),
            queue.getActive(0, 10),
            queue.getCompleted(0, limit),
            queue.getFailed(0, 10),
        ]);

        const allJobs = [...waiting, ...active, ...completed, ...failed];

        // Filter by userId and map to status
        const userJobs = allJobs
            .filter((job) => job.data?.userId === userId)
            .slice(0, limit);

        return Promise.all(userJobs.map((job) => this.mapJobToStatus(job)));
    }

    /**
     * Wait for job completion (with polling)
     */
    async waitForJob(
        queueName: 'ai' | 'media',
        jobId: string,
        timeoutMs: number = 120000
    ): Promise<JobStatus> {
        const queue = queueName === 'ai' ? this.aiQueue : this.mediaQueue;
        const job = await queue.getJob(jobId);

        if (!job) {
            throw new Error(`Job ${jobId} not found`);
        }

        const startTime = Date.now();
        const pollInterval = 1000; // 1 second

        while (Date.now() - startTime < timeoutMs) {
            const state = await job.getState();

            if (state === 'completed' || state === 'failed') {
                return this.mapJobToStatus(job);
            }

            await new Promise((resolve) => setTimeout(resolve, pollInterval));
        }

        throw new Error(`Job ${jobId} timed out after ${timeoutMs}ms`);
    }

    /**
     * Map BullMQ job to JobStatus
     */
    private async mapJobToStatus(job: Job): Promise<JobStatus> {
        const state = await job.getState();

        return {
            jobId: job.id!,
            status: state as JobStatus['status'],
            progress: job.progress as number || 0,
            result: state === 'completed' ? job.returnvalue : undefined,
            error: state === 'failed' ? job.failedReason : undefined,
            createdAt: new Date(job.timestamp),
            processedAt: job.processedOn ? new Date(job.processedOn) : undefined,
            finishedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
            attemptsMade: job.attemptsMade,
        };
    }
}
