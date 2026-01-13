/**
 * OpenRouter Chat Completion DTOs
 * Request/Response validation for chat endpoints
 */

import {
    IsString,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsArray,
    ValidateNested,
    IsIn,
    Min,
    Max,
    IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PREMIUM_MODELS, PremiumModelId } from '../types/openrouter.types';

// ============================================
// Message DTOs
// ============================================

export class ImageUrlDto {
    @ApiProperty({ description: 'Image URL or base64 data URL' })
    @IsString()
    url: string;

    @ApiPropertyOptional({ enum: ['auto', 'low', 'high'], default: 'auto' })
    @IsOptional()
    @IsIn(['auto', 'low', 'high'])
    detail?: 'auto' | 'low' | 'high';
}

export class AudioUrlDto {
    @ApiProperty({ description: 'Base64 encoded audio data URL' })
    @IsString()
    url: string;
}

export class ContentPartDto {
    @ApiProperty({ enum: ['text', 'image_url', 'audio_url'] })
    @IsIn(['text', 'image_url', 'audio_url'])
    type: 'text' | 'image_url' | 'audio_url';

    @ApiPropertyOptional({ description: 'Text content' })
    @IsOptional()
    @IsString()
    text?: string;

    @ApiPropertyOptional({ type: ImageUrlDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => ImageUrlDto)
    image_url?: ImageUrlDto;

    @ApiPropertyOptional({ type: AudioUrlDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => AudioUrlDto)
    audio_url?: AudioUrlDto;
}

export class ChatMessageDto {
    @ApiProperty({ enum: ['system', 'user', 'assistant', 'tool'] })
    @IsIn(['system', 'user', 'assistant', 'tool'])
    role: 'system' | 'user' | 'assistant' | 'tool';

    @ApiProperty({
        description: 'Message content - string or array of content parts',
        oneOf: [{ type: 'string' }, { type: 'array', items: { $ref: '#/components/schemas/ContentPartDto' } }],
    })
    content: string | ContentPartDto[];

    @ApiPropertyOptional({ description: 'Optional name for the message author' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Tool call ID when role is tool' })
    @IsOptional()
    @IsString()
    tool_call_id?: string;
}

// ============================================
// Tool/Function Calling DTOs
// ============================================

export class FunctionParametersDto {
    @ApiProperty({ description: 'JSON Schema for function parameters' })
    @IsObject()
    type: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    properties?: Record<string, unknown>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    required?: string[];

    // Allow additional properties for JSON Schema compatibility
    [key: string]: unknown;
}

export class FunctionDefinitionDto {
    @ApiProperty({ description: 'Function name' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Function description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Function parameters as JSON Schema' })
    @ValidateNested()
    @Type(() => FunctionParametersDto)
    parameters: FunctionParametersDto;
}

export class ToolDefinitionDto {
    @ApiProperty({ enum: ['function'], default: 'function' })
    @IsIn(['function'])
    type: 'function';

    @ApiProperty({ type: FunctionDefinitionDto })
    @ValidateNested()
    @Type(() => FunctionDefinitionDto)
    function: FunctionDefinitionDto;
}

// ============================================
// Main Request DTO
// ============================================

export class ChatCompletionRequestDto {
    @ApiProperty({
        description: 'Model ID to use for generation',
        example: PREMIUM_MODELS.CLAUDE_SONNET_4_5,
        enum: Object.values(PREMIUM_MODELS),
    })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiProperty({
        description: 'Array of messages in the conversation',
        type: [ChatMessageDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChatMessageDto)
    messages: ChatMessageDto[];

    @ApiPropertyOptional({
        description: 'Sampling temperature (0-2)',
        minimum: 0,
        maximum: 2,
        default: 0.7,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(2)
    temperature?: number;

    @ApiPropertyOptional({
        description: 'Top-p sampling (0-1)',
        minimum: 0,
        maximum: 1,
        default: 1,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    top_p?: number;

    @ApiPropertyOptional({
        description: 'Maximum tokens to generate',
        minimum: 1,
        maximum: 65536,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(65536)
    max_tokens?: number;

    @ApiPropertyOptional({
        description: 'Enable streaming response',
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    stream?: boolean;

    @ApiPropertyOptional({
        description: 'Tools/functions available for the model to call',
        type: [ToolDefinitionDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ToolDefinitionDto)
    tools?: ToolDefinitionDto[];

    @ApiPropertyOptional({
        description: 'Stop sequences',
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    stop?: string[];

    @ApiPropertyOptional({
        description: 'Frequency penalty (-2 to 2)',
        minimum: -2,
        maximum: 2,
    })
    @IsOptional()
    @IsNumber()
    @Min(-2)
    @Max(2)
    frequency_penalty?: number;

    @ApiPropertyOptional({
        description: 'Presence penalty (-2 to 2)',
        minimum: -2,
        maximum: 2,
    })
    @IsOptional()
    @IsNumber()
    @Min(-2)
    @Max(2)
    presence_penalty?: number;

    @ApiPropertyOptional({
        description: 'Random seed for deterministic generation',
    })
    @IsOptional()
    @IsNumber()
    seed?: number;
}

// ============================================
// Response DTOs
// ============================================

export class ToolCallFunctionDto {
    @ApiProperty()
    name: string;

    @ApiProperty({ description: 'JSON string of arguments' })
    arguments: string;
}

export class ToolCallDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: ['function'] })
    type: 'function';

    @ApiProperty({ type: ToolCallFunctionDto })
    function: ToolCallFunctionDto;
}

export class ResponseMessageDto {
    @ApiProperty({ enum: ['assistant'] })
    role: 'assistant';

    @ApiPropertyOptional({ description: 'Text content of the response' })
    content?: string | null;

    @ApiPropertyOptional({ type: [ToolCallDto] })
    tool_calls?: ToolCallDto[];
}

export class ChoiceDto {
    @ApiProperty()
    index: number;

    @ApiProperty({ type: ResponseMessageDto })
    message: ResponseMessageDto;

    @ApiProperty({
        enum: ['stop', 'length', 'tool_calls', 'content_filter'],
        nullable: true,
    })
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

export class UsageDto {
    @ApiProperty()
    prompt_tokens: number;

    @ApiProperty()
    completion_tokens: number;

    @ApiProperty()
    total_tokens: number;
}

export class ChatCompletionResponseDto {
    @ApiProperty({ description: 'Unique response ID' })
    id: string;

    @ApiProperty({ default: 'chat.completion' })
    object: string;

    @ApiProperty({ description: 'Unix timestamp of creation' })
    created: number;

    @ApiProperty({ description: 'Model used for generation' })
    model: string;

    @ApiProperty({ type: [ChoiceDto] })
    choices: ChoiceDto[];

    @ApiProperty({ type: UsageDto })
    usage: UsageDto;

    @ApiPropertyOptional()
    system_fingerprint?: string;
}
