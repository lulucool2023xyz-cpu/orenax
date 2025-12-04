/**
 * Gemini API Type Definitions
 * Based on Official Google Gemini API Documentation
 */

import type {
    GeminiModelId,
    HarmCategory,
    SafetyThreshold,
    FunctionCallingMode,
    FinishReason,
    ThinkingLevel,
} from './gemini-constants';

// Re-export for convenience
export type {
    GeminiModelId,
    HarmCategory,
    SafetyThreshold,
    FunctionCallingMode,
    FinishReason,
    ThinkingLevel,
};

/**
 * Role types for conversation
 */
export type GeminiRole = 'user' | 'model' | 'system';

/**
 * Text Part
 */
export interface TextPart {
    text: string;
}

/**
 * Inline Data Part (for images, audio, etc)
 */
export interface InlineDataPart {
    inlineData: {
        mimeType: string;
        data: string; // Base64 encoded
    };
}

/**
 * File Data Part (for Files API)
 */
export interface FileDataPart {
    fileData: {
        mimeType: string;
        fileUri: string;
    };
}

/**
 * Function Call Part
 */
export interface FunctionCallPart {
    functionCall: {
        name: string;
        args: Record<string, unknown>;
    };
}

/**
 * Function Response Part
 */
export interface FunctionResponsePart {
    functionResponse: {
        name: string;
        response: Record<string, unknown>;
    };
}

/**
 * Thought Part (for thinking models)
 */
export interface ThoughtPart {
    thought: true;
    text: string;
}

/**
 * Union type for all possible parts
 */
export type GeminiPart =
    | TextPart
    | InlineDataPart
    | FileDataPart
    | FunctionCallPart
    | FunctionResponsePart
    | ThoughtPart;

/**
 * Content structure (message)
 */
export interface GeminiContent {
    role: GeminiRole;
    parts: GeminiPart[];
}

/**
 * Safety Setting
 */
export interface SafetySetting {
    category: HarmCategory;
    threshold: SafetyThreshold;
}

/**
 * Safety Rating in response
 */
export interface SafetyRating {
    category: HarmCategory;
    probability: 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH';
    blocked?: boolean;
}

/**
 * Thinking Configuration
 */
export interface ThinkingConfig {
    // For Gemini 3 models
    thinkingLevel?: ThinkingLevel;
    // For Gemini 2.5 models
    thinkingBudget?: number; // -1 for dynamic, 0 to disable, or specific number
    // Whether to include thought summaries in response
    includeThoughts?: boolean;
}

/**
 * Generation Configuration
 */
export interface GenerationConfig {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
    candidateCount?: number;
    responseMimeType?: 'text/plain' | 'application/json';
    responseSchema?: JsonSchema;
}

/**
 * JSON Schema for structured output
 */
export interface JsonSchema {
    type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
    description?: string;
    properties?: Record<string, JsonSchema>;
    items?: JsonSchema;
    required?: string[];
    enum?: (string | number | boolean)[];
    nullable?: boolean;
}

/**
 * Function Declaration for function calling
 */
export interface FunctionDeclaration {
    name: string;
    description?: string;
    parameters?: JsonSchema;
}

/**
 * Tool Definition
 */
export interface Tool {
    functionDeclarations?: FunctionDeclaration[];
    codeExecution?: {
        // Enable code execution
    };
}

/**
 * Tool Configuration
 */
export interface ToolConfig {
    functionCallingConfig?: {
        mode: FunctionCallingMode;
        allowedFunctionNames?: string[];
    };
}

/**
 * Usage Metadata in response
 */
export interface UsageMetadata {
    promptTokenCount: number;
    candidatesTokenCount: number;
    thoughtsTokenCount?: number;
    totalTokenCount: number;
    cachedContentTokenCount?: number;
    toolUsePromptTokenCount?: number;
    promptTokensDetails?: ModalityTokenCount[];
    candidatesTokensDetails?: ModalityTokenCount[];
}

/**
 * Token count by modality
 */
export interface ModalityTokenCount {
    modality: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO';
    tokenCount: number;
}

/**
 * Grounding Chunk from web search
 */
export interface GroundingChunk {
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
 * Grounding Support
 */
export interface GroundingSupport {
    segment: {
        startIndex: number;
        endIndex: number;
        text: string;
    };
    groundingChunkIndices: number[];
    confidenceScores: number[];
}

/**
 * Grounding Metadata in response
 */
export interface GroundingMetadata {
    groundingChunks?: GroundingChunk[];
    groundingSupports?: GroundingSupport[];
    webSearchQueries?: string[];
    searchEntryPoint?: {
        renderedContent: string;
    };
}

/**
 * Candidate response
 */
export interface Candidate {
    content: GeminiContent;
    finishReason: FinishReason;
    safetyRatings?: SafetyRating[];
    citationMetadata?: {
        citations: Array<{
            startIndex: number;
            endIndex: number;
            uri: string;
            title: string;
        }>;
    };
    tokenCount?: number;
    groundingMetadata?: GroundingMetadata;
    avgLogprobs?: number;
    index?: number;
}

/**
 * Prompt Feedback
 */
export interface PromptFeedback {
    blockReason?: 'BLOCK_REASON_UNSPECIFIED' | 'SAFETY' | 'OTHER' | 'BLOCKLIST' | 'PROHIBITED_CONTENT';
    safetyRatings?: SafetyRating[];
}

/**
 * Full Generate Content Response
 */
export interface GenerateContentResponse {
    candidates?: Candidate[];
    promptFeedback?: PromptFeedback;
    usageMetadata?: UsageMetadata;
    modelVersion?: string;
    responseId?: string;
}

/**
 * File Upload Configuration
 */
export interface FileUploadConfig {
    mimeType?: string;
    displayName?: string;
}

/**
 * Uploaded File Info
 */
export interface UploadedFile {
    name: string;
    uri: string;
    mimeType: string;
    sizeBytes?: number;
    createTime?: string;
    updateTime?: string;
    expirationTime?: string;
    sha256Hash?: string;
    state?: 'PROCESSING' | 'ACTIVE' | 'FAILED';
}

/**
 * Multimodal Content Input
 */
export interface MultimodalInput {
    type: 'image' | 'video' | 'audio' | 'document';
    // For inline data (base64)
    base64Data?: string;
    mimeType?: string;
    // For file URI
    fileUri?: string;
    // For URL (images, YouTube videos)
    url?: string;
}

/**
 * Chat History Entry (for storage)
 */
export interface ChatHistoryEntry {
    role: GeminiRole;
    content: string;
    parts?: GeminiPart[];
    timestamp: Date;
    metadata?: {
        finishReason?: FinishReason;
        usageMetadata?: UsageMetadata;
        thoughts?: string[];
        groundingMetadata?: GroundingMetadata;
        functionCalls?: FunctionCallPart['functionCall'][];
    };
}

/**
 * Streaming Chunk
 */
export interface StreamingChunk {
    text?: string;
    thought?: string;
    functionCall?: FunctionCallPart['functionCall'];
    finishReason?: FinishReason;
    usageMetadata?: UsageMetadata;
}
