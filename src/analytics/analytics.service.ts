/**
 * Analytics Service
 * Track and aggregate API usage data
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UsageRecord {
    userId: string;
    endpoint: string;
    method: string;
    model?: string;
    tokensUsed?: number;
    cost?: number;
    responseTime: number;
    status: 'success' | 'error';
    timestamp: Date;
}

export interface UsageSummary {
    userId: string;
    period: 'day' | 'week' | 'month';
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalTokens: number;
    totalCost: number;
    averageResponseTime: number;
    byEndpoint: Record<string, number>;
    byModel: Record<string, number>;
}

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    // In-memory storage (in production, use database or Redis)
    private usageRecords: UsageRecord[] = [];
    private readonly maxRecords = 10000;

    constructor(private readonly configService: ConfigService) { }

    /**
     * Track a single API request
     */
    async trackUsage(record: UsageRecord): Promise<void> {
        this.usageRecords.push(record);

        // Limit memory usage
        if (this.usageRecords.length > this.maxRecords) {
            this.usageRecords = this.usageRecords.slice(-this.maxRecords);
        }

        this.logger.debug(
            `Tracked: ${record.userId} -> ${record.method} ${record.endpoint} (${record.responseTime}ms)`,
        );
    }

    /**
     * Get usage summary for a user
     */
    async getUserUsageSummary(
        userId: string,
        period: 'day' | 'week' | 'month' = 'day',
    ): Promise<UsageSummary> {
        const now = new Date();
        const cutoff = this.getPeriodCutoff(period);

        const userRecords = this.usageRecords.filter(
            (r) => r.userId === userId && r.timestamp >= cutoff,
        );

        const byEndpoint: Record<string, number> = {};
        const byModel: Record<string, number> = {};

        let totalTokens = 0;
        let totalCost = 0;
        let totalResponseTime = 0;
        let successCount = 0;
        let failCount = 0;

        for (const record of userRecords) {
            // Aggregate by endpoint
            byEndpoint[record.endpoint] = (byEndpoint[record.endpoint] || 0) + 1;

            // Aggregate by model
            if (record.model) {
                byModel[record.model] = (byModel[record.model] || 0) + 1;
            }

            // Totals
            totalTokens += record.tokensUsed || 0;
            totalCost += record.cost || 0;
            totalResponseTime += record.responseTime;

            if (record.status === 'success') {
                successCount++;
            } else {
                failCount++;
            }
        }

        return {
            userId,
            period,
            totalRequests: userRecords.length,
            successfulRequests: successCount,
            failedRequests: failCount,
            totalTokens,
            totalCost,
            averageResponseTime:
                userRecords.length > 0 ? totalResponseTime / userRecords.length : 0,
            byEndpoint,
            byModel,
        };
    }

    /**
     * Get global usage stats (admin)
     */
    async getGlobalStats(period: 'day' | 'week' | 'month' = 'day'): Promise<{
        totalRequests: number;
        uniqueUsers: number;
        topEndpoints: Array<{ endpoint: string; count: number }>;
        topModels: Array<{ model: string; count: number }>;
        errorRate: number;
        averageResponseTime: number;
    }> {
        const cutoff = this.getPeriodCutoff(period);
        const records = this.usageRecords.filter((r) => r.timestamp >= cutoff);

        const uniqueUsers = new Set(records.map((r) => r.userId)).size;

        const endpointCounts: Record<string, number> = {};
        const modelCounts: Record<string, number> = {};
        let errorCount = 0;
        let totalResponseTime = 0;

        for (const record of records) {
            endpointCounts[record.endpoint] =
                (endpointCounts[record.endpoint] || 0) + 1;

            if (record.model) {
                modelCounts[record.model] = (modelCounts[record.model] || 0) + 1;
            }

            if (record.status === 'error') errorCount++;
            totalResponseTime += record.responseTime;
        }

        const topEndpoints = Object.entries(endpointCounts)
            .map(([endpoint, count]) => ({ endpoint, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const topModels = Object.entries(modelCounts)
            .map(([model, count]) => ({ model, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            totalRequests: records.length,
            uniqueUsers,
            topEndpoints,
            topModels,
            errorRate: records.length > 0 ? errorCount / records.length : 0,
            averageResponseTime:
                records.length > 0 ? totalResponseTime / records.length : 0,
        };
    }

    /**
     * Get cost tracking for a user
     */
    async getUserCostTracking(
        userId: string,
        period: 'day' | 'week' | 'month' = 'month',
    ): Promise<{
        totalCost: number;
        byModel: Array<{ model: string; cost: number; requests: number }>;
        byDay: Array<{ date: string; cost: number }>;
    }> {
        const cutoff = this.getPeriodCutoff(period);
        const records = this.usageRecords.filter(
            (r) => r.userId === userId && r.timestamp >= cutoff && r.cost,
        );

        const byModelMap: Record<string, { cost: number; requests: number }> = {};
        const byDayMap: Record<string, number> = {};
        let totalCost = 0;

        for (const record of records) {
            const cost = record.cost || 0;
            totalCost += cost;

            // By model
            if (record.model) {
                if (!byModelMap[record.model]) {
                    byModelMap[record.model] = { cost: 0, requests: 0 };
                }
                byModelMap[record.model].cost += cost;
                byModelMap[record.model].requests++;
            }

            // By day
            const dateKey = record.timestamp.toISOString().split('T')[0];
            byDayMap[dateKey] = (byDayMap[dateKey] || 0) + cost;
        }

        return {
            totalCost,
            byModel: Object.entries(byModelMap)
                .map(([model, data]) => ({ model, ...data }))
                .sort((a, b) => b.cost - a.cost),
            byDay: Object.entries(byDayMap)
                .map(([date, cost]) => ({ date, cost }))
                .sort((a, b) => a.date.localeCompare(b.date)),
        };
    }

    /**
     * Calculate period cutoff date
     */
    private getPeriodCutoff(period: 'day' | 'week' | 'month'): Date {
        const now = new Date();
        switch (period) {
            case 'day':
                return new Date(now.getTime() - 24 * 60 * 60 * 1000);
            case 'week':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case 'month':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
    }

    /**
     * Export usage data (for admin/reporting)
     */
    async exportUsageData(
        startDate: Date,
        endDate: Date,
    ): Promise<UsageRecord[]> {
        return this.usageRecords.filter(
            (r) => r.timestamp >= startDate && r.timestamp <= endDate,
        );
    }
}
