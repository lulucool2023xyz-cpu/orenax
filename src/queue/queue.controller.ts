/**
 * Queue Controller
 * API endpoints for job queue management
 */

import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
} from '@nestjs/common';
import type { Request } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QueueService, AiGenerationJobData } from './queue.service';
import { JobStatusService, JobStatus } from './job-status.service';

// DTOs
class AddJobDto {
    type: 'chat' | 'vision' | 'audio' | 'function_calling';
    model?: string;
    messages: any[];
    options?: Record<string, any>;
    priority?: 'high' | 'normal' | 'low';
}

class JobIdResponse {
    jobId: string;
    message: string;
}

@ApiTags('Job Queue')
@ApiBearerAuth()
@Controller('api/v2/jobs')
@UseGuards(JwtAuthGuard)
export class QueueController {
    constructor(
        private readonly queueService: QueueService,
        private readonly jobStatusService: JobStatusService,
    ) { }

    // ========================================
    // Create Jobs
    // ========================================

    @Post('ai')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({
        summary: 'Add AI generation job',
        description: 'Queue an AI generation job for async processing. Returns job ID for status tracking.',
    })
    @ApiResponse({
        status: 202,
        description: 'Job queued successfully',
        type: JobIdResponse,
    })
    async addAiJob(
        @Body() body: AddJobDto,
        @Req() req: Request,
    ): Promise<JobIdResponse> {
        const userId = (req as any).user?.sub || 'anonymous';

        const jobData: AiGenerationJobData = {
            type: body.type,
            userId,
            model: body.model || 'anthropic/claude-sonnet-4.5',
            messages: body.messages,
            options: body.options,
            priority: body.priority,
        };

        const jobId = await this.queueService.addAiGenerationJob(jobData);

        return {
            jobId,
            message: 'Job queued for processing',
        };
    }

    // ========================================
    // Job Status
    // ========================================

    @Get('ai/:jobId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get AI job status' })
    @ApiParam({ name: 'jobId', description: 'Job ID' })
    @ApiResponse({ status: 200, description: 'Job status' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    async getAiJobStatus(@Param('jobId') jobId: string): Promise<JobStatus | { error: string }> {
        const status = await this.jobStatusService.getJobStatus('ai', jobId);

        if (!status) {
            return { error: 'Job not found' };
        }

        return status;
    }

    @Get('ai/:jobId/wait')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Wait for job completion',
        description: 'Long-poll endpoint that waits for job to complete (max 120s)',
    })
    @ApiParam({ name: 'jobId' })
    @ApiQuery({ name: 'timeout', required: false, description: 'Timeout in ms (max 120000)' })
    async waitForAiJob(
        @Param('jobId') jobId: string,
        @Query('timeout') timeout?: string,
    ): Promise<JobStatus> {
        const timeoutMs = Math.min(parseInt(timeout || '60000'), 120000);

        return this.jobStatusService.waitForJob('ai', jobId, timeoutMs);
    }

    @Get('user')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get jobs for current user' })
    @ApiQuery({ name: 'queue', required: false, enum: ['ai', 'media'], description: 'Queue type' })
    @ApiQuery({ name: 'limit', required: false, description: 'Max results' })
    async getUserJobs(
        @Req() req: Request,
        @Query('queue') queue: 'ai' | 'media' = 'ai',
        @Query('limit') limit?: string,
    ): Promise<JobStatus[]> {
        const userId = (req as any).user?.sub;

        return this.jobStatusService.getUserJobs(
            queue,
            userId,
            parseInt(limit || '20'),
        );
    }

    // ========================================
    // Job Management
    // ========================================

    @Delete('ai/:jobId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cancel a waiting/delayed job' })
    @ApiParam({ name: 'jobId' })
    async cancelAiJob(@Param('jobId') jobId: string): Promise<{ cancelled: boolean }> {
        const cancelled = await this.queueService.cancelJob('ai', jobId);
        return { cancelled };
    }

    @Post('ai/:jobId/retry')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Retry a failed job' })
    @ApiParam({ name: 'jobId' })
    async retryAiJob(@Param('jobId') jobId: string): Promise<{ retried: boolean }> {
        const retried = await this.queueService.retryJob('ai', jobId);
        return { retried };
    }

    // ========================================
    // Queue Stats (Admin)
    // ========================================

    @Get('stats')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get queue statistics' })
    @ApiQuery({ name: 'queue', required: false, enum: ['ai', 'media'] })
    async getQueueStats(@Query('queue') queue: 'ai' | 'media' = 'ai') {
        return this.queueService.getQueueStats(queue);
    }
}
