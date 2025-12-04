import { Logger } from '@nestjs/common';
import { ERROR_MESSAGES } from '../types/constants';

/**
 * Error handler utility for Vertex AI
 * Transforms Google Cloud errors into user-friendly messages
 */
export class VertexAiErrorHandler {
    private static readonly logger = new Logger('VertexAiErrorHandler');

    /**
     * Handle and transform Vertex AI errors
     */
    static handleError(error: any): never {
        this.logger.error('Vertex AI Error:', error);

        // Google Cloud specific errors
        if (error.code) {
            switch (error.code) {
                case 401:
                case 403:
                    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
                case 404:
                    throw new Error(ERROR_MESSAGES.INVALID_MODEL);
                case 429:
                    throw new Error(ERROR_MESSAGES.RATE_LIMIT);
                case 503:
                    throw new Error(ERROR_MESSAGES.SERVICE_UNAVAILABLE);
            }
        }

        // Generic Google Cloud errors
        if (error.message) {
            if (error.message.includes('quota')) {
                throw new Error(ERROR_MESSAGES.QUOTA_EXCEEDED);
            }
            if (error.message.includes('credentials')) {
                throw new Error(ERROR_MESSAGES.MISSING_API_KEY);
            }
            if (error.message.includes('invalid')) {
                throw new Error(ERROR_MESSAGES.INVALID_REQUEST);
            }
        }

        // Default error
        throw new Error(ERROR_MESSAGES.INTERNAL_ERROR);
    }

    /**
     * Check if error is retryable
     */
    static isRetryable(error: any): boolean {
        if (!error.code) return false;

        // Retry on rate limits and temporary service issues
        return [429, 500, 502, 503, 504].includes(error.code);
    }

    /**
     * Log error for debugging
     */
    static logError(context: string, error: any): void {
        this.logger.error(`[${context}] Error:`, {
            message: error.message,
            code: error.code,
            stack: error.stack,
        });
    }
}

/**
 * Retry utility with exponential backoff
 */
export class RetryUtil {
    static async withRetry<T>(
        fn: () => Promise<T>,
        maxRetries: number = 3,
        initialDelay: number = 1000,
    ): Promise<T> {
        let lastError: any;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                // Don't retry if error is not retryable or max retries reached
                if (!VertexAiErrorHandler.isRetryable(error) || attempt === maxRetries) {
                    break;
                }

                // Calculate delay with exponential backoff
                const delay = initialDelay * Math.pow(2, attempt);
                Logger.log(`Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);

                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError;
    }
}
