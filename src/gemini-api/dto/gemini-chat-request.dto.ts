import {
    IsString,
    IsOptional,
    IsBoolean,
    IsArray,
    ValidateNested,
    IsNumber,
    IsIn,
    IsObject,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
    GEMINI_MODELS,
    HARM_CATEGORIES,
    SAFETY_THRESHOLDS,
    FUNCTION_CALLING_MODES,
    THINKING_LEVELS,
} from '../types';

/**
 * Content Part DTO
 */
export class GeminiPartDto {
    @IsOptional()
    @IsString()
    text?: string;

    @IsOptional()
    @IsObject()
    inlineData?: {
        mimeType: string;
        data: string;
    };

    @IsOptional()
    @IsObject()
    fileData?: {
        mimeType: string;
        fileUri: string;
    };
}

/**
 * Message/Content DTO
 */
export class GeminiContentDto {
    @IsString()
    @IsIn(['user', 'model'])
    role: 'user' | 'model';

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GeminiPartDto)
    parts: GeminiPartDto[];
}

/**
 * Simple Message DTO (alternative to Content)
 */
export class SimpleMessageDto {
    @IsString()
    @IsIn(['user', 'model'])
    role: 'user' | 'model';

    @IsString()
    content: string;
}

/**
 * Safety Setting DTO
 */
export class SafetySettingDto {
    @IsString()
    @IsIn(HARM_CATEGORIES)
    category: string;

    @IsString()
    @IsIn(SAFETY_THRESHOLDS)
    threshold: string;
}

/**
 * Thinking Configuration DTO
 */
export class ThinkingConfigDto {
    @IsOptional()
    @IsString()
    @IsIn(THINKING_LEVELS)
    thinkingLevel?: string;

    @IsOptional()
    @IsNumber()
    thinkingBudget?: number;

    @IsOptional()
    @IsBoolean()
    includeThoughts?: boolean;
}

/**
 * JSON Schema DTO for structured output
 */
export class JsonSchemaDto {
    @IsString()
    @IsIn(['string', 'number', 'integer', 'boolean', 'array', 'object'])
    type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsObject()
    properties?: Record<string, JsonSchemaDto>;

    @IsOptional()
    @ValidateNested()
    @Type(() => JsonSchemaDto)
    items?: JsonSchemaDto;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    required?: string[];

    @IsOptional()
    @IsArray()
    enum?: (string | number | boolean)[];

    @IsOptional()
    @IsBoolean()
    nullable?: boolean;
}

/**
 * Generation Configuration DTO
 */
export class GenerationConfigDto {
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(2)
    temperature?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    topP?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    topK?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    maxOutputTokens?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    stopSequences?: string[];

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(1)
    candidateCount?: number;

    @IsOptional()
    @IsString()
    @IsIn(['text/plain', 'application/json'])
    responseMimeType?: 'text/plain' | 'application/json';

    @IsOptional()
    @ValidateNested()
    @Type(() => JsonSchemaDto)
    responseSchema?: JsonSchemaDto;
}

/**
 * Function Declaration DTO
 */
export class FunctionDeclarationDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => JsonSchemaDto)
    parameters?: JsonSchemaDto;
}

/**
 * Dynamic Retrieval Config for Google Search
 */
export class DynamicRetrievalConfigDto {
    @IsOptional()
    @IsString()
    @IsIn(['MODE_DYNAMIC', 'MODE_UNSPECIFIED'])
    mode?: 'MODE_DYNAMIC' | 'MODE_UNSPECIFIED';

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    dynamicThreshold?: number;
}

/**
 * Google Search Config DTO
 */
export class GoogleSearchConfigDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => DynamicRetrievalConfigDto)
    dynamicRetrievalConfig?: DynamicRetrievalConfigDto;
}

/**
 * Tool DTO - Supports function declarations, Google Search, and Code Execution
 */
export class ToolDto {
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FunctionDeclarationDto)
    functionDeclarations?: FunctionDeclarationDto[];

    @IsOptional()
    @ValidateNested()
    @Type(() => GoogleSearchConfigDto)
    googleSearch?: GoogleSearchConfigDto;

    @IsOptional()
    @IsObject()
    codeExecution?: Record<string, unknown>;
}

/**
 * Function Calling Config DTO
 */
export class FunctionCallingConfigDto {
    @IsString()
    @IsIn(FUNCTION_CALLING_MODES)
    mode: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allowedFunctionNames?: string[];
}

/**
 * Tool Config DTO
 */
export class ToolConfigDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => FunctionCallingConfigDto)
    functionCallingConfig?: FunctionCallingConfigDto;
}

/**
 * Main Chat Request DTO
 */
export class GeminiChatRequestDto {
    @IsOptional()
    @IsString()
    @IsIn(Object.keys(GEMINI_MODELS))
    model?: string;

    // Option 1: Full content structure
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GeminiContentDto)
    contents?: GeminiContentDto[];

    // Option 2: Simple messages (will be converted to contents)
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SimpleMessageDto)
    messages?: SimpleMessageDto[];

    // Option 3: Just a prompt string
    @IsOptional()
    @IsString()
    prompt?: string;

    @IsOptional()
    @IsString()
    systemInstruction?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => GenerationConfigDto)
    generationConfig?: GenerationConfigDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => ThinkingConfigDto)
    thinkingConfig?: ThinkingConfigDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SafetySettingDto)
    safetySettings?: SafetySettingDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ToolDto)
    tools?: ToolDto[];

    @IsOptional()
    @ValidateNested()
    @Type(() => ToolConfigDto)
    toolConfig?: ToolConfigDto;

    @IsOptional()
    @IsBoolean()
    stream?: boolean;
}

/**
 * Count Tokens Request DTO
 */
export class GeminiCountTokensRequestDto {
    @IsOptional()
    @IsString()
    @IsIn(Object.keys(GEMINI_MODELS))
    model?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GeminiContentDto)
    contents?: GeminiContentDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SimpleMessageDto)
    messages?: SimpleMessageDto[];

    @IsOptional()
    @IsString()
    prompt?: string;
}
