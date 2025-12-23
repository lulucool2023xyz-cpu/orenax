import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global AI Exception Filter
 * catches AI specific errors (Safety, Quota, etc.) and returns standardized responses
 */
@Catch()
export class AiExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(AiExceptionFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal AI processing error';
        let code = 'AI_INTERNAL_ERROR';
        let details = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res: any = exception.getResponse();
            message = res.message || exception.message;
        } else {
            // Handle generic errors (like SDK errors)
            const errMessage = exception.message?.toLowerCase() || '';

            if (errMessage.includes('quota') || errMessage.includes('429')) {
                status = HttpStatus.TOO_MANY_REQUESTS;
                message = 'AI Quota exceeded. Please try again later.';
                code = 'AI_QUOTA_EXCEEDED';
            } else if (errMessage.includes('safety') || errMessage.includes('blocked')) {
                status = HttpStatus.BAD_REQUEST;
                message = 'Response blocked by safety filters.';
                code = 'AI_SAFETY_BLOCKED';
            } else if (errMessage.includes('invalid') || errMessage.includes('400')) {
                status = HttpStatus.BAD_REQUEST;
                message = exception.message;
                code = 'AI_INVALID_REQUEST';
            }

            this.logger.error(`AI Core Error: ${exception.message}`, exception.stack);
        }

        // Maintain backward compatibility for frontend
        // V1 expectation: { success: false, error: string }
        // V2 expectation: { statusCode, message, error }

        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            error: code,
            details,
            timestamp: new Date().toISOString(),
        });
    }
}
