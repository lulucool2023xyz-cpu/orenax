/**
 * Analytics Controller
 * API endpoints for usage statistics and cost tracking
 */

import {
    Controller,
    Get,
    Query,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('api/v2/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('usage')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get current user usage summary',
        description: 'Returns API usage statistics for the authenticated user',
    })
    @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month'] })
    async getUserUsage(
        @Req() req: Request,
        @Query('period') period: 'day' | 'week' | 'month' = 'day',
    ) {
        const userId = (req as any).user?.sub;
        return this.analyticsService.getUserUsageSummary(userId, period);
    }

    @Get('costs')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get cost tracking for current user',
        description: 'Returns cost breakdown by model and day',
    })
    @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month'] })
    async getUserCosts(
        @Req() req: Request,
        @Query('period') period: 'day' | 'week' | 'month' = 'month',
    ) {
        const userId = (req as any).user?.sub;
        return this.analyticsService.getUserCostTracking(userId, period);
    }

    @Get('global')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get global usage statistics (admin)',
        description: 'Returns platform-wide usage statistics',
    })
    @ApiQuery({ name: 'period', required: false, enum: ['day', 'week', 'month'] })
    async getGlobalStats(
        @Query('period') period: 'day' | 'week' | 'month' = 'day',
    ) {
        // TODO: Add admin guard
        return this.analyticsService.getGlobalStats(period);
    }
}
