import { IsString, IsOptional, IsArray, ValidateNested, IsBoolean, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ThinkingConfigDto } from './thinking-config.dto';
import { MultimodalContentDto } from './multimodal-content.dto';
import { GroundingConfigDto } from './grounding.dto';

/**
 * Message DTO - represents a single message in the conversation
 */
export class MessageDto {
    @IsString()
    role: 'user' | 'model';

    @IsString()
    content: string;
}

export class GenerationConfigDto {
    @IsOptional()
    temperature?: number;

    @IsOptional()
    topP?: number;

    @IsOptional()
    topK?: number;

    @IsOptional()
    maxOutputTokens?: number;

    @IsOptional()
    candidateCount?: number;

    @IsOptional()
    @IsArray()
    stopSequences?: string[];

    @IsOptional()
    @IsString()
    responseMimeType?: string;

    @IsOptional()
    responseSchema?: any;
}

/**
 * Main Chat Request DTO (with Phase 2 support)
 */
export class ChatRequestDto {
    @IsOptional()
    @IsString()
    model?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MessageDto)
    messages: MessageDto[];

    @IsOptional()
    @IsBoolean()
    stream?: boolean;

    @IsOptional()
    @ValidateNested()
    @Type(() => GenerationConfigDto)
    generationConfig?: GenerationConfigDto;

    @IsOptional()
    @IsString()
    systemInstruction?: string;

    @IsOptional()
    @IsObject()
    tools?: any;

    // Phase 2: Thinking Mode
    @IsOptional()
    @ValidateNested()
    @Type(() => ThinkingConfigDto)
    thinkingConfig?: ThinkingConfigDto;

    // Phase 2: Multimodal Content
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MultimodalContentDto)
    multimodalContents?: MultimodalContentDto[];

    // Phase 3: Grounding
    @IsOptional()
    @ValidateNested()
    @Type(() => GroundingConfigDto)
    groundingConfig?: GroundingConfigDto; // Google Search, Maps, URL context
}

/**
 * Count Tokens Request DTO
 */
export class CountTokensRequestDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MessageDto)
    messages: MessageDto[];

    @IsOptional()
    @IsString()
    model?: string;
}
