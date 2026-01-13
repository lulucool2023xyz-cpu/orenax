/**
 * OpenRouter Streaming Response DTOs
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StreamDeltaDto {
    @ApiPropertyOptional({ enum: ['assistant'] })
    role?: 'assistant';

    @ApiPropertyOptional({ description: 'Content chunk' })
    content?: string;
}

export class StreamChoiceDto {
    @ApiProperty()
    index: number;

    @ApiProperty({ type: StreamDeltaDto })
    delta: StreamDeltaDto;

    @ApiProperty({ nullable: true })
    finish_reason: string | null;
}

export class StreamChunkDto {
    @ApiProperty({ description: 'Response ID' })
    id: string;

    @ApiProperty({ default: 'chat.completion.chunk' })
    object: string;

    @ApiProperty({ description: 'Unix timestamp' })
    created: number;

    @ApiProperty({ description: 'Model used' })
    model: string;

    @ApiProperty({ type: [StreamChoiceDto] })
    choices: StreamChoiceDto[];
}

/**
 * SSE Event format for streaming
 */
export class ServerSentEvent {
    @ApiProperty({ description: 'Event type (message or done)' })
    event: 'message' | 'done' | 'error';

    @ApiProperty({ description: 'Event data as JSON string' })
    data: string;
}
