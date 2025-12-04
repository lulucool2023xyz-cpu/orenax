/**
 * Chat Response DTOs
 */

export class MessageResponseDto {
    role: 'user' | 'model';
    content: string;
    finishReason?: string;
    thoughts?: string[]; // Thinking process (Gemini 2.5)
}

export class UsageMetadataDto {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
}

export class ChatResponseDto {
    message: MessageResponseDto;
    usageMetadata?: UsageMetadataDto;
    groundingMetadata?: any; // Grounding sources (Google Search/Maps)
    model: string;
    conversationId?: string;
}

export class StreamChunkDto {
    content: string;
    done: boolean;
    usageMetadata?: UsageMetadataDto;
}

export class CountTokensResponseDto {
    totalTokens: number;
    model: string;
}
