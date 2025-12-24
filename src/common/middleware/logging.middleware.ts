import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Logging Middleware
 * Logs all incoming requests and outgoing responses
 * JSON format in production, colorized in development
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, ip } = req;
        const userAgent = req.get('user-agent') || '-';
        const startTime = Date.now();

        // Log request
        if (process.env.NODE_ENV === 'production') {
            // JSON format for production (easier to parse in log aggregators)
            this.logger.log(
                JSON.stringify({
                    type: 'request',
                    method,
                    url: originalUrl,
                    ip,
                    userAgent,
                }),
            );
        } else {
            // Colorized format for development
            this.logger.log(`→ ${method} ${originalUrl} [${ip}]`);
        }

        // Log response on finish
        res.on('finish', () => {
            const { statusCode } = res;
            const duration = Date.now() - startTime;

            if (process.env.NODE_ENV === 'production') {
                this.logger.log(
                    JSON.stringify({
                        type: 'response',
                        method,
                        url: originalUrl,
                        statusCode,
                        duration: `${duration}ms`,
                    }),
                );
            } else {
                const statusColor = statusCode >= 400 ? '❌' : '✅';
                this.logger.log(
                    `${statusColor} ${method} ${originalUrl} ${statusCode} - ${duration}ms`,
                );
            }
        });

        next();
    }
}
