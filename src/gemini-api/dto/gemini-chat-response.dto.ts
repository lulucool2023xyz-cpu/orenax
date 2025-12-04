import { FinishReason, HarmCategory } from '../types';

/**
 * Usage Metadata Response DTO
 */
export class UsageMetadataDto {
    promptTokenCount: number;
    candidatesTokenCount: number;
    thoughtsTokenCount?: number;
    totalTokenCount: number;
    cachedContentTokenCount?: number;
}

/**
 * Safety Rating Response DTO
 */
export class SafetyRatingDto {
    category: HarmCategory;
    probability: 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH';
    blocked?: boolean;
}

/**
 * Function Call Response DTO
 */
export class FunctionCallDto {
    name: string;
    args: Record<string, unknown>;
}

/**
 * Grounding Chunk DTO
 */
export class GroundingChunkDto {
    web?: {
        uri: string;
        title: string;
    };
    retrievedContext?: {
        uri: string;
        title: string;
    };
}

/**
 * Grounding Metadata DTO
 */
export class GroundingMetadataDto {
    groundingChunks?: GroundingChunkDto[];
    webSearchQueries?: string[];
    searchEntryPoint?: {
        renderedContent: string;
    };
}

/**
 * Code Execution Result DTO
 */
export class CodeExecutionResultDto {
    /**
     * The code that was executed
     */
    code: string;

    /**
     * The output of the code execution
     */
    output: string;

    /**
     * Programming language
     */
    language?: string;

    /**
     * Whether execution was successful
     */
    success?: boolean;

    /**
     * Error message if execution failed
     */
    error?: string;
}

/**
 * Main Chat Response DTO
 */
export class GeminiChatResponseDto {
    /**
     * Generated text response
     */
    text: string;

    /**
     * Thought summaries (if thinking mode enabled and includeThoughts is true)
     */
    thoughts?: string[];

    /**
     * Reason why generation stopped
     */
    finishReason: FinishReason;

    /**
     * Token usage information
     */
    usageMetadata: UsageMetadataDto;

    /**
     * Function calls requested by the model
     */
    functionCalls?: FunctionCallDto[];

    /**
     * Code execution result (if code execution tool was used)
     */
    codeExecutionResult?: CodeExecutionResultDto;

    /**
     * Grounding information (if grounding/Google Search enabled)
     */
    groundingMetadata?: GroundingMetadataDto;

    /**
     * Safety ratings for the response
     */
    safetyRatings?: SafetyRatingDto[];

    /**
     * Model used for generation
     */
    model: string;

    /**
     * Model version
     */
    modelVersion?: string;

    /**
     * Conversation ID for multi-turn chats
     */
    conversationId?: string;

    /**
     * Response ID from API
     */
    responseId?: string;

    /**
     * Whether the response was grounded with Google Search
     */
    isGrounded?: boolean;
}

/**
 * Streaming Chunk Response DTO
 */
export class GeminiStreamChunkDto {
    /**
     * Text chunk
     */
    text?: string;

    /**
     * Thought chunk (if thinking mode)
     */
    thought?: string;

    /**
     * Function call (if any)
     */
    functionCall?: FunctionCallDto;

    /**
     * Finish reason (only in last chunk)
     */
    finishReason?: FinishReason;

    /**
     * Usage metadata (only in last chunk)
     */
    usageMetadata?: UsageMetadataDto;

    /**
     * Whether this is the last chunk
     */
    done: boolean;
}

/**
 * Count Tokens Response DTO
 */
export class GeminiCountTokensResponseDto {
    totalTokens: number;
    model: string;
}

/**
 * Models List Response DTO
 */
export class GeminiModelInfoDto {
    name: string;
    displayName: string;
    description: string;
    supportsThinking: boolean;
    thinkingType: 'level' | 'budget' | null;
    maxInputTokens: number;
    maxOutputTokens: number;
    supportedFeatures: string[];
}

export class GeminiModelsResponseDto {
    models: GeminiModelInfoDto[];
    defaultModel: string;
}

/**
 * File Upload Response DTO
 */
export class GeminiFileUploadResponseDto {
    name: string;
    uri: string;
    mimeType: string;
    sizeBytes?: number;
    state: 'PROCESSING' | 'ACTIVE' | 'FAILED';
    expirationTime?: string;
}

/**
 * Error Response DTO
 */
export class GeminiErrorResponseDto {
    statusCode: number;
    message: string;
    error: string;
    details?: {
        blockReason?: string;
        safetyRatings?: SafetyRatingDto[];
        finishReason?: FinishReason;
    };
}
