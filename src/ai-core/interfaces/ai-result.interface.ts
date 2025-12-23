/**
 * Standardized AI Result Envelope
 * Matches both V1 (success: boolean) and V2 patterns
 */

export interface AiResult<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    metadata?: {
        processTimeMs?: number;
        provider?: 'gemini' | 'vertex' | 'openai';
        model?: string;
    };
}

export interface AiError {
    code: string;
    message: string;
    status: number;
    details?: any;
}
