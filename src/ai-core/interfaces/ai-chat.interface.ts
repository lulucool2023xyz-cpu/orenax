/**
 * Standardized AI Chat Interfaces
 * 
 * These interfaces define the internal contract for AI providers.
 * Translators will map these to/from external DTOs (V1, V2, Vertex).
 */

export interface AiChatMessage {
    role: 'user' | 'model' | 'assistant' | 'system';
    content: string;
    parts?: Array<{
        text?: string;
        inlineData?: {
            mimeType: string;
            data: string;
        };
        fileData?: {
            mimeType: string;
            fileUri: string;
        };
    }>;
}

export interface AiChatOptions {
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
    stopSequences?: string[];
    systemInstruction?: string;
    useGoogleSearch?: boolean;
}

export interface AiChatResponse {
    text: string;
    thoughts?: string[];
    finishReason: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    grounding?: any;
    functionCalls?: any[];
    model: string;
}

export interface AiStreamChunk {
    text?: string;
    thought?: string;
    done: boolean;
    finishReason?: string;
    usage?: any;
}
