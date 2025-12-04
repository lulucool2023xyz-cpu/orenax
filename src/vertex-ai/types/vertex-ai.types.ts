/**
 * Vertex AI Types and Interfaces
 * 
 * Based on Google Cloud Vertex AI API Protocol
 * Reference: google.cloud.aiplatform.v1
 */

/**
 * Content represents a message in the conversation
 */
export interface Content {
    role: 'user' | 'model';
    parts: Part[];
}

/**
 * Part represents a single piece of content (text, image, etc.)
 */
export interface Part {
    text?: string;
    inlineData?: Blob;
    fileData?: FileData;
    functionCall?: FunctionCall;
    functionResponse?: FunctionResponse;
}

/**
 * Blob for inline data (base64 encoded)
 */
export interface Blob {
    mimeType: string;
    data: string; // base64 encoded
}

/**
 * FileData for files stored in Google Cloud Storage
 */
export interface FileData {
    mimeType: string;
    fileUri: string; // gs://bucket/path or https://...
}

/**
 * Generation configuration parameters
 */
export interface GenerationConfig {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    candidateCount?: number;
    stopSequences?: string[];
    responseMimeType?: string;
    responseSchema?: any;

    // Thinking mode (Phase 2)
    thinkingConfig?: ThinkingConfig;
}

/**
 * Thinking configuration
 */
export interface ThinkingConfig {
    thinkingBudget?: number; // For Gemini 2.5
    thinkingLevel?: 'LOW' | 'HIGH'; // For Gemini 3
    includeThoughts?: boolean;
}

/**
 * Safety settings
 */
export interface SafetySetting {
    category: HarmCategory;
    threshold: HarmBlockThreshold;
}

export enum HarmCategory {
    HARM_CATEGORY_UNSPECIFIED = 'HARM_CATEGORY_UNSPECIFIED',
    HARM_CATEGORY_HATE_SPEECH = 'HARM_CATEGORY_HATE_SPEECH',
    HARM_CATEGORY_DANGEROUS_CONTENT = 'HARM_CATEGORY_DANGEROUS_CONTENT',
    HARM_CATEGORY_HARASSMENT = 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_SEXUALLY_EXPLICIT = 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
}

export enum HarmBlockThreshold {
    BLOCK_LOW_AND_ABOVE = 'BLOCK_LOW_AND_ABOVE',
    BLOCK_MEDIUM_AND_ABOVE = 'BLOCK_MEDIUM_AND_ABOVE',
    BLOCK_ONLY_HIGH = 'BLOCK_ONLY_HIGH',
    BLOCK_NONE = 'BLOCK_NONE',
}

/**
 * Tool definition
 */
export interface Tool {
    functionDeclarations?: FunctionDeclaration[];
    googleSearch?: GoogleSearch;
    googleMaps?: GoogleMaps;
}

/**
 * Function declaration for function calling
 */
export interface FunctionDeclaration {
    name: string;
    description: string;
    parameters?: any; // JSON Schema
}

/**
 * Function call from model
 */
export interface FunctionCall {
    name: string;
    args: any;
}

/**
 * Function response to model
 */
export interface FunctionResponse {
    name: string;
    response: any;
}

/**
 * Google Search grounding
 */
export interface GoogleSearch {
    excludeDomains?: string[];
}

/**
 * Google Maps grounding
 */
export interface GoogleMaps {
    enableWidget?: boolean;
}

/**
 * Candidate response from model
 */
export interface Candidate {
    index?: number;
    content: Content;
    finishReason?: FinishReason;
    safetyRatings?: SafetyRating[];
    citationMetadata?: CitationMetadata;
    groundingMetadata?: GroundingMetadata;
}

export enum FinishReason {
    FINISH_REASON_UNSPECIFIED = 'FINISH_REASON_UNSPECIFIED',
    STOP = 'STOP',
    MAX_TOKENS = 'MAX_TOKENS',
    SAFETY = 'SAFETY',
    RECITATION = 'RECITATION',
    OTHER = 'OTHER',
}

/**
 * Safety rating
 */
export interface SafetyRating {
    category: HarmCategory;
    probability: HarmProbability;
}

export enum HarmProbability {
    HARM_PROBABILITY_UNSPECIFIED = 'HARM_PROBABILITY_UNSPECIFIED',
    NEGLIGIBLE = 'NEGLIGIBLE',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

/**
 * Citation metadata
 */
export interface CitationMetadata {
    citations: Citation[];
}

export interface Citation {
    startIndex: number;
    endIndex: number;
    uri: string;
    title?: string;
}

/**
 * Grounding metadata
 */
export interface GroundingMetadata {
    searchUrls?: string[];
    groundingChunks?: GroundingChunk[];
}

export interface GroundingChunk {
    web?: {
        uri: string;
        title?: string;
    };
}

/**
 * Usage metadata
 */
export interface UsageMetadata {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
}

/**
 * Generate content request
 */
export interface GenerateContentRequest {
    model: string;
    contents: Content[];
    generationConfig?: GenerationConfig;
    safetySettings?: SafetySetting[];
    tools?: Tool[];
    systemInstruction?: Content;
    cachedContent?: string;
}

/**
 * Generate content response
 */
export interface GenerateContentResponse {
    candidates: Candidate[];
    promptFeedback?: PromptFeedback;
    usageMetadata?: UsageMetadata;
}

export interface PromptFeedback {
    blockReason?: string;
    safetyRatings?: SafetyRating[];
}

/**
 * Stream chunk for streaming responses
 */
export interface StreamChunk {
    candidates?: Candidate[];
    usageMetadata?: UsageMetadata;
}
