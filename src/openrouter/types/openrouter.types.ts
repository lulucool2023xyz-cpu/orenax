/**
 * OpenRouter Types & Interfaces
 * Premium-focused AI model integration
 */

// ============================================
// Premium Model Registry
// ============================================

/**
 * Premium models prioritized for production use
 * These are high-quality models with excellent reasoning capabilities
 */
export const PREMIUM_MODELS = {
    // Anthropic - Top Tier
    CLAUDE_OPUS_4_5: 'anthropic/claude-opus-4.5',
    CLAUDE_SONNET_4_5: 'anthropic/claude-sonnet-4.5',
    CLAUDE_SONNET_4: 'anthropic/claude-sonnet-4',
    CLAUDE_OPUS_4: 'anthropic/claude-opus-4',
    CLAUDE_3_5_SONNET: 'anthropic/claude-3.5-sonnet',
    CLAUDE_3_OPUS: 'anthropic/claude-3-opus',

    // OpenAI - Top Tier
    GPT_5_2: 'openai/gpt-5.2',
    GPT_5_2_PRO: 'openai/gpt-5.2-pro',
    GPT_4O: 'openai/gpt-4o',
    GPT_4O_AUDIO: 'openai/gpt-4o-audio-preview',
    GPT_4_TURBO: 'openai/gpt-4-turbo',
    O1: 'openai/o1',
    O1_PRO: 'openai/o1-pro',

    // Google - Top Tier
    GEMINI_2_5_PRO: 'google/gemini-2.5-pro',
    GEMINI_2_5_FLASH: 'google/gemini-2.5-flash',
    GEMINI_3_FLASH: 'google/gemini-3-flash-preview',

    // Other Premium
    LLAMA_4_MAVERICK: 'meta-llama/llama-4-maverick',
    MISTRAL_LARGE: 'mistralai/mistral-large',
    DEEPSEEK_R1: 'deepseek/deepseek-r1',
} as const;

export type PremiumModelId = typeof PREMIUM_MODELS[keyof typeof PREMIUM_MODELS];

// ============================================
// Model Capabilities
// ============================================

export interface ModelCapabilities {
    supportsVision: boolean;
    supportsAudio: boolean;
    supportsFunctionCalling: boolean;
    supportsStreaming: boolean;
    supportsSystemPrompt: boolean;
    maxContextTokens: number;
    maxOutputTokens: number;
}

/**
 * Premium model capabilities registry
 */
export const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
    // Claude Opus 4.5 - Most capable
    [PREMIUM_MODELS.CLAUDE_OPUS_4_5]: {
        supportsVision: true,
        supportsAudio: false,
        supportsFunctionCalling: true,
        supportsStreaming: true,
        supportsSystemPrompt: true,
        maxContextTokens: 200000,
        maxOutputTokens: 32768,
    },
    // Claude Sonnet 4.5 - Balanced
    [PREMIUM_MODELS.CLAUDE_SONNET_4_5]: {
        supportsVision: true,
        supportsAudio: false,
        supportsFunctionCalling: true,
        supportsStreaming: true,
        supportsSystemPrompt: true,
        maxContextTokens: 200000,
        maxOutputTokens: 16384,
    },
    // GPT-5.2 - Latest OpenAI
    [PREMIUM_MODELS.GPT_5_2]: {
        supportsVision: true,
        supportsAudio: false,
        supportsFunctionCalling: true,
        supportsStreaming: true,
        supportsSystemPrompt: true,
        maxContextTokens: 128000,
        maxOutputTokens: 16384,
    },
    // GPT-4o - Multimodal
    [PREMIUM_MODELS.GPT_4O]: {
        supportsVision: true,
        supportsAudio: true,
        supportsFunctionCalling: true,
        supportsStreaming: true,
        supportsSystemPrompt: true,
        maxContextTokens: 128000,
        maxOutputTokens: 16384,
    },
    // Gemini 2.5 Pro
    [PREMIUM_MODELS.GEMINI_2_5_PRO]: {
        supportsVision: true,
        supportsAudio: true,
        supportsFunctionCalling: true,
        supportsStreaming: true,
        supportsSystemPrompt: true,
        maxContextTokens: 1048576,
        maxOutputTokens: 65536,
    },
};

// ============================================
// Request/Response Types
// ============================================

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ContentPart {
    type: 'text' | 'image_url' | 'audio_url';
    text?: string;
    image_url?: {
        url: string; // base64 or URL
        detail?: 'auto' | 'low' | 'high';
    };
    audio_url?: {
        url: string; // base64 encoded audio
    };
}

export interface ChatMessage {
    role: MessageRole;
    content: string | ContentPart[];
    name?: string;
    tool_call_id?: string;
    tool_calls?: ToolCall[];
}

export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string; // JSON string
    };
}

export interface FunctionDefinition {
    name: string;
    description?: string;
    parameters: Record<string, unknown>; // JSON Schema
}

export interface ToolDefinition {
    type: 'function';
    function: FunctionDefinition;
}

export interface OpenRouterRequest {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    stream?: boolean;
    tools?: ToolDefinition[];
    tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
    response_format?: { type: 'text' | 'json_object' };
    stop?: string[];
    frequency_penalty?: number;
    presence_penalty?: number;
    seed?: number;
}

export interface OpenRouterChoice {
    index: number;
    message: ChatMessage;
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
    logprobs?: unknown;
}

export interface OpenRouterUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

export interface OpenRouterResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: OpenRouterChoice[];
    usage: OpenRouterUsage;
    system_fingerprint?: string;
}

// Streaming types
export interface StreamDelta {
    role?: MessageRole;
    content?: string;
    tool_calls?: Partial<ToolCall>[];
}

export interface StreamChoice {
    index: number;
    delta: StreamDelta;
    finish_reason: string | null;
}

export interface OpenRouterStreamChunk {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: StreamChoice[];
}

// ============================================
// Model Info Types
// ============================================

export interface OpenRouterModelPricing {
    prompt: number;    // per 1M tokens
    completion: number; // per 1M tokens
    image?: number;     // per image
    request?: number;   // per request
}

export interface OpenRouterModel {
    id: string;
    name: string;
    description?: string;
    context_length: number;
    pricing: OpenRouterModelPricing;
    top_provider?: {
        context_length?: number;
        max_completion_tokens?: number;
        is_moderated?: boolean;
    };
    per_request_limits?: unknown;
    architecture?: {
        modality: string;
        tokenizer: string;
        instruct_type?: string;
    };
}

export interface OpenRouterModelsResponse {
    data: OpenRouterModel[];
}

// ============================================
// Error Types
// ============================================

export interface OpenRouterError {
    error: {
        message: string;
        type: string;
        param?: string;
        code?: string;
    };
}

export class OpenRouterApiError extends Error {
    constructor(
        public readonly statusCode: number,
        public readonly errorType: string,
        message: string,
        public readonly originalError?: OpenRouterError,
    ) {
        super(message);
        this.name = 'OpenRouterApiError';
    }
}
