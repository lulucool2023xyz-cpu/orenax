import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

/**
 * Custom Throttler Guard
 * Extends default guard with custom error messages and skip logic
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected async throwThrottlingException(): Promise<void> {
        throw new ThrottlerException('Too many requests. Please slow down.');
    }

    /**
     * Skip throttling for certain routes (e.g., health checks)
     */
    protected async shouldSkip(context: any): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const path = request.route?.path || request.url;

        // Skip rate limiting for health check endpoints
        if (path.includes('/health')) {
            return true;
        }

        return false;
    }
}
