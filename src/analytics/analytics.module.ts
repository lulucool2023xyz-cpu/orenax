/**
 * Analytics Module
 * Track API usage and costs per user
 */

import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { UsageTrackingInterceptor } from './interceptors/usage-tracking.interceptor';

@Global()
@Module({
    imports: [ConfigModule],
    controllers: [AnalyticsController],
    providers: [
        AnalyticsService,
        UsageTrackingInterceptor,
    ],
    exports: [AnalyticsService, UsageTrackingInterceptor],
})
export class AnalyticsModule { }
