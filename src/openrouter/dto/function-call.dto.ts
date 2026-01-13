/**
 * OpenRouter Function Calling DTOs
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsArray,
    ValidateNested,
    IsObject,
    IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChatMessageDto, ToolDefinitionDto } from './chat-completion.dto';

// ============================================
// Function Calling Request
// ============================================

export class FunctionCallRequestDto {
    @ApiProperty({ description: 'Model to use (must support function calling)' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiProperty({ type: [ChatMessageDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChatMessageDto)
    messages: ChatMessageDto[];

    @ApiProperty({
        description: 'Available functions/tools for the model',
        type: [ToolDefinitionDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ToolDefinitionDto)
    tools: ToolDefinitionDto[];

    @ApiPropertyOptional({
        description: 'Tool choice: auto, none, or specific function',
        default: 'auto',
    })
    @IsOptional()
    tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

// ============================================
// Function Call Execution
// ============================================

export class FunctionResultDto {
    @ApiProperty({ description: 'Tool call ID from the assistant message' })
    @IsString()
    tool_call_id: string;

    @ApiProperty({ description: 'Result of the function execution as JSON string' })
    @IsString()
    result: string;
}

export class SubmitFunctionResultsDto {
    @ApiProperty({ description: 'Model to use' })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiProperty({
        description: 'Full conversation including the assistant tool_calls message',
        type: [ChatMessageDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChatMessageDto)
    messages: ChatMessageDto[];

    @ApiProperty({
        description: 'Results from executed functions',
        type: [FunctionResultDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FunctionResultDto)
    function_results: FunctionResultDto[];

    @ApiPropertyOptional({
        description: 'Tools definition (same as original request)',
        type: [ToolDefinitionDto],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ToolDefinitionDto)
    tools?: ToolDefinitionDto[];
}

// ============================================
// Built-in Function Schemas
// ============================================

/**
 * Pre-defined function schemas for common use cases
 */
export const BUILTIN_FUNCTIONS = {
    WEB_SEARCH: {
        type: 'function' as const,
        function: {
            name: 'web_search',
            description: 'Search the web for current information',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'The search query',
                    },
                    num_results: {
                        type: 'number',
                        description: 'Number of results to return (1-10)',
                        default: 5,
                    },
                },
                required: ['query'],
            },
        },
    },
    GET_WEATHER: {
        type: 'function' as const,
        function: {
            name: 'get_weather',
            description: 'Get current weather for a location',
            parameters: {
                type: 'object',
                properties: {
                    location: {
                        type: 'string',
                        description: 'City name or coordinates',
                    },
                    unit: {
                        type: 'string',
                        enum: ['celsius', 'fahrenheit'],
                        default: 'celsius',
                    },
                },
                required: ['location'],
            },
        },
    },
    CALCULATE: {
        type: 'function' as const,
        function: {
            name: 'calculate',
            description: 'Perform mathematical calculations',
            parameters: {
                type: 'object',
                properties: {
                    expression: {
                        type: 'string',
                        description: 'Mathematical expression to evaluate',
                    },
                },
                required: ['expression'],
            },
        },
    },
    GENERATE_IMAGE: {
        type: 'function' as const,
        function: {
            name: 'generate_image',
            description: 'Generate an image from a text description',
            parameters: {
                type: 'object',
                properties: {
                    prompt: {
                        type: 'string',
                        description: 'Detailed description of the image to generate',
                    },
                    style: {
                        type: 'string',
                        enum: ['realistic', 'artistic', 'cartoon', 'abstract'],
                        default: 'realistic',
                    },
                },
                required: ['prompt'],
            },
        },
    },
};
