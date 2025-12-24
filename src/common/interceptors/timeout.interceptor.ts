import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

/**
 * Timeout Interceptor
 * Applies configurable timeout to all requests
 * Default: 30 seconds, AI generation: 120 seconds
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    constructor(private readonly timeoutMs: number = 30000) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const path = request.route?.path || request.url || '';

        // Longer timeout for AI generation endpoints
        let requestTimeout = this.timeoutMs;
        if (
            path.includes('/generate') ||
            path.includes('/stream') ||
            path.includes('/image') ||
            path.includes('/video') ||
            path.includes('/music')
        ) {
            requestTimeout = 120000; // 2 minutes for generation
        }

        return next.handle().pipe(
            timeout(requestTimeout),
            catchError((err) => {
                if (err instanceof TimeoutError) {
                    return throwError(
                        () => new RequestTimeoutException('Request timeout. Please try again.'),
                    );
                }
                return throwError(() => err);
            }),
        );
    }
}
