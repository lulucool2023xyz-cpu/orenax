/**
 * OpenRouter Model List DTOs
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsIn } from 'class-validator';

// ============================================
// Request DTOs
// ============================================

export class ListModelsQueryDto {
    @ApiPropertyOptional({ description: 'Filter by capability' })
    @IsOptional()
    @IsIn(['vision', 'audio', 'function_calling', 'streaming'])
    capability?: 'vision' | 'audio' | 'function_calling' | 'streaming';

    @ApiPropertyOptional({ description: 'Filter by provider' })
    @IsOptional()
    @IsString()
    provider?: string;

    @ApiPropertyOptional({ description: 'Only show premium models', default: true })
    @IsOptional()
    @IsBoolean()
    premium_only?: boolean;
}

// ============================================
// Response DTOs
// ============================================

export class ModelPricingDto {
    @ApiProperty({ description: 'Cost per 1M prompt tokens (USD)' })
    prompt: number;

    @ApiProperty({ description: 'Cost per 1M completion tokens (USD)' })
    completion: number;

    @ApiPropertyOptional({ description: 'Cost per image (USD)' })
    image?: number;
}

export class ModelCapabilitiesDto {
    @ApiProperty()
    supportsVision: boolean;

    @ApiProperty()
    supportsAudio: boolean;

    @ApiProperty()
    supportsFunctionCalling: boolean;

    @ApiProperty()
    supportsStreaming: boolean;

    @ApiProperty()
    maxContextTokens: number;

    @ApiProperty()
    maxOutputTokens: number;
}

export class ModelInfoDto {
    @ApiProperty({ description: 'Model ID (e.g., anthropic/claude-opus-4.5)' })
    id: string;

    @ApiProperty({ description: 'Human-readable model name' })
    name: string;

    @ApiPropertyOptional({ description: 'Model description' })
    description?: string;

    @ApiProperty({ description: 'Provider name (e.g., Anthropic, OpenAI)' })
    provider: string;

    @ApiProperty({ description: 'Context window size in tokens' })
    context_length: number;

    @ApiProperty({ type: ModelPricingDto })
    pricing: ModelPricingDto;

    @ApiProperty({ type: ModelCapabilitiesDto })
    capabilities: ModelCapabilitiesDto;

    @ApiProperty({ description: 'Model tier: flagship, balanced, fast' })
    tier: 'flagship' | 'balanced' | 'fast';
}

export class ModelsListResponseDto {
    @ApiProperty({ type: [ModelInfoDto] })
    models: ModelInfoDto[];

    @ApiProperty({ description: 'Total number of models' })
    total: number;

    @ApiProperty({ description: 'Whether only premium models are shown' })
    premium_only: boolean;
}
