/**
 * AI Job Processor
 * Processes AI generation jobs from the queue
 */

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../queue.constants';
import { AiGenerationJobData, JobResult } from '../queue.service';

@Processor(QUEUE_NAMES.AI_GENERATION)
export class AiJobProcessor extends WorkerHost {
    private readonly logger = new Logger(AiJobProcessor.name);

    // Note: In a real implementation, inject OpenRouterChatService here
    // constructor(private readonly chatService: OpenRouterChatService) { super(); }

    async process(job: Job<AiGenerationJobData, JobResult>): Promise<JobResult> {
        this.logger.log(`Processing job ${job.id} - Type: ${job.data.type}`);

        try {
            // Update progress
            await job.updateProgress(10);

            const result = await this.executeJob(job);

            await job.updateProgress(100);

            return {
                success: true,
                data: result,
            };
        } catch (error: any) {
            this.logger.error(`Job ${job.id} failed: ${error.message}`);

            return {
                success: false,
                error: error.message,
            };
        }
    }

    private async executeJob(job: Job<AiGenerationJobData, JobResult>): Promise<any> {
        const { type, model, messages, options } = job.data;

        // Placeholder: In production, call the actual OpenRouter service
        // const chatService = this.moduleRef.get(OpenRouterChatService);

        switch (type) {
            case 'chat':
                await job.updateProgress(30);
                // const response = await this.chatService.createChatCompletion({
                //     model,
                //     messages,
                //     ...options,
                // });
                // return response;

                // Placeholder response
                return {
                    message: 'Job processed successfully',
                    type,
                    model,
                    timestamp: new Date().toISOString(),
                };

            case 'vision':
                await job.updateProgress(30);
                return {
                    message: 'Vision job processed',
                    type,
                    model,
                };

            case 'audio':
                await job.updateProgress(30);
                return {
                    message: 'Audio job processed',
                    type,
                    model,
                };

            case 'function_calling':
                await job.updateProgress(30);
                return {
                    message: 'Function calling job processed',
                    type,
                    model,
                };

            default:
                throw new Error(`Unknown job type: ${type}`);
        }
    }

    @OnWorkerEvent('active')
    onActive(job: Job) {
        this.logger.debug(`Job ${job.id} is now active`);
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(`Job ${job.id} completed successfully`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        this.logger.error(`Job ${job.id} failed: ${error.message}`);
    }

    @OnWorkerEvent('progress')
    onProgress(job: Job, progress: number) {
        this.logger.debug(`Job ${job.id} progress: ${progress}%`);
    }
}
