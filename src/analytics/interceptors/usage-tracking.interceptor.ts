/**
 * Usage Tracking Interceptor
 * Automatically tracks API usage for analytics
 */

import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AnalyticsService, UsageRecord } from '../analytics.service';

@Injectable()
export class UsageTrackingInterceptor implements NestInterceptor {
    constructor(private readonly analyticsService: AnalyticsService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const startTime = Date.now();

        const userId = request.user?.sub || request.user?.id || 'anonymous';
        const endpoint = request.route?.path || request.url;
        const method = request.method;

        return next.handle().pipe(
            tap((response) => {
                const record: UsageRecord = {
                    userId,
                    endpoint,
                    method,
                    model: this.extractModel(request.body),
                    tokensUsed: this.extractTokens(response),
                    cost: this.calculateCost(response),
                    responseTime: Date.now() - startTime,
                    status: 'success',
                    timestamp: new Date(),
                };

                this.analyticsService.trackUsage(record);
            }),
            catchError((error) => {
                const record: UsageRecord = {
                    userId,
                    endpoint,
                    method,
                    model: this.extractModel(request.body),
                    responseTime: Date.now() - startTime,
                    status: 'error',
                    timestamp: new Date(),
                };

                this.analyticsService.trackUsage(record);
                throw error;
            }),
        );
    }

    private extractModel(body: any): string | undefined {
        return body?.model;
    }

    private extractTokens(response: any): number | undefined {
        return response?.usage?.total_tokens;
    }

    private calculateCost(response: any): number | undefined {
        const usage = response?.usage;
        if (!usage) return undefined;

        // Approximate cost calculation (adjust per model)
        const promptTokens = usage.prompt_tokens || 0;
        const completionTokens = usage.completion_tokens || 0;

        // Default pricing (Claude Sonnet-like)
        const promptCostPer1k = 0.003;
        const completionCostPer1k = 0.015;

        return (
            (promptTokens / 1000) * promptCostPer1k +
            (completionTokens / 1000) * completionCostPer1k
        );
    }
}
