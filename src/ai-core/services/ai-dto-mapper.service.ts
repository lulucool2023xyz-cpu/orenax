import { Injectable } from '@nestjs/common';
import { AiChatMessage, AiChatResponse, AiStreamChunk } from '../interfaces/ai-chat.interface';

@Injectable()
export class AiDtoMapperService {
    /**
     * Convert V1/V2 messages to internal format
     */
    toInternalMessages(messages: any[]): AiChatMessage[] {
        return messages.map((msg) => {
            // Handle V1 (content) and V2 (parts) formats
            if (msg.parts) {
                return {
                    role: msg.role === 'model' ? 'assistant' : msg.role,
                    content: msg.parts.map((p: any) => p.text).join(' '),
                    parts: msg.parts,
                };
            }
            return {
                role: msg.role || 'user',
                content: msg.content || '',
            };
        });
    }

    /**
     * Map internal response to V2 DTO (GeminiChatResponseDto)
     */
    toV2Response(internal: AiChatResponse): any {
        return {
            text: internal.text,
            thoughts: internal.thoughts,
            finishReason: internal.finishReason,
            usageMetadata: {
                promptTokenCount: internal.usage.promptTokens,
                candidatesTokenCount: internal.usage.completionTokens,
                totalTokenCount: internal.usage.totalTokens,
            },
            groundingMetadata: internal.grounding,
            model: internal.model,
        };
    }

    /**
     * Map internal response to V1 Format
     */
    toV1Response(internal: AiChatResponse): any {
        return {
            success: true,
            model: internal.model,
            response: {
                text: internal.text,
                thoughts: internal.thoughts,
                grounding: internal.grounding,
            },
            usage: {
                promptTokenCount: internal.usage.promptTokens,
                candidatesTokenCount: internal.usage.completionTokens,
                totalTokenCount: internal.usage.totalTokens,
            },
        };
    }

    /**
     * Map internal stream chunk to V2/V1 stream formats
     */
    mapStreamChunk(chunk: AiStreamChunk, format: 'v1' | 'v2'): string {
        if (format === 'v2') {
            return JSON.stringify({
                text: chunk.text,
                thought: chunk.thought,
                done: chunk.done,
                finishReason: chunk.finishReason,
            });
        }
        // V1 pattern usually returns just text or simple JSON
        return JSON.stringify({
            text: chunk.text,
            done: chunk.done,
        });
    }
}
