import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import type { HealthCheckResult } from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('health')
@SkipThrottle()
export class HealthController {
    constructor(private health: HealthCheckService) { }

    /**
     * Liveness probe - checks if the app is running
     * Used by Railway/Kubernetes to know if container should be restarted
     */
    @Get('live')
    @HealthCheck()
    live(): HealthCheckResult {
        return {
            status: 'ok',
            details: {
                app: { status: 'up' },
            },
        } as HealthCheckResult;
    }

    /**
     * Readiness probe - checks if the app is ready to receive traffic
     * Used by Railway/Kubernetes for load balancing decisions
     */
    @Get('ready')
    @HealthCheck()
    async ready(): Promise<HealthCheckResult> {
        return this.health.check([
            // Add additional health indicators here if needed
            // () => this.db.pingCheck('database'),
        ]);
    }
}
