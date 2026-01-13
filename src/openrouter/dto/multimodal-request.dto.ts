/**
 * OpenRouter Multimodal Request DTOs
 * For vision (image) and audio processing
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsArray,
    ValidateNested,
    IsIn,
    IsNumber,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PREMIUM_MODELS } from '../types/openrouter.types';

// ============================================
// Vision (Image Analysis) DTOs
// ============================================

export class ImageInputDto {
    @ApiProperty({
        description: 'Image URL or base64 data URL (data:image/...;base64,...)',
        example: 'https://example.com/image.jpg',
    })
    @IsString()
    url: string;

    @ApiPropertyOptional({
        description: 'Image detail level for processing',
        enum: ['auto', 'low', 'high'],
        default: 'auto',
    })
    @IsOptional()
    @IsIn(['auto', 'low', 'high'])
    detail?: 'auto' | 'low' | 'high';
}

export class VisionRequestDto {
    @ApiProperty({
        description: 'Vision-capable model to use',
        example: PREMIUM_MODELS.GPT_4O,
        enum: [
            PREMIUM_MODELS.CLAUDE_OPUS_4_5,
            PREMIUM_MODELS.CLAUDE_SONNET_4_5,
            PREMIUM_MODELS.GPT_4O,
            PREMIUM_MODELS.GEMINI_2_5_PRO,
        ],
    })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiProperty({
        description: 'Array of images to analyze',
        type: [ImageInputDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImageInputDto)
    images: ImageInputDto[];

    @ApiProperty({
        description: 'Question or instruction about the image(s)',
        example: 'Describe what you see in this image in detail',
    })
    @IsString()
    prompt: string;

    @ApiPropertyOptional({
        description: 'System prompt for context',
    })
    @IsOptional()
    @IsString()
    system_prompt?: string;

    @ApiPropertyOptional({
        description: 'Maximum tokens for response',
        default: 4096,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(16384)
    max_tokens?: number;

    @ApiPropertyOptional({
        description: 'Temperature for generation',
        default: 0.7,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(2)
    temperature?: number;
}

export class VisionResponseDto {
    @ApiProperty({ description: 'Analysis result' })
    content: string;

    @ApiProperty({ description: 'Model used' })
    model: string;

    @ApiProperty({ description: 'Token usage' })
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };

    @ApiProperty({ description: 'Number of images processed' })
    images_processed: number;
}

// ============================================
// Audio Processing DTOs
// ============================================

export class AudioInputDto {
    @ApiProperty({
        description: 'Base64 encoded audio data URL (data:audio/...;base64,...)',
    })
    @IsString()
    url: string;

    @ApiPropertyOptional({
        description: 'Audio format',
        enum: ['mp3', 'wav', 'ogg', 'webm', 'm4a'],
    })
    @IsOptional()
    @IsIn(['mp3', 'wav', 'ogg', 'webm', 'm4a'])
    format?: string;
}

export class AudioRequestDto {
    @ApiProperty({
        description: 'Audio-capable model to use',
        example: PREMIUM_MODELS.GPT_4O_AUDIO,
        enum: [
            PREMIUM_MODELS.GPT_4O_AUDIO,
            PREMIUM_MODELS.GPT_4O,
            PREMIUM_MODELS.GEMINI_2_5_PRO,
        ],
    })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiProperty({
        description: 'Audio file to process',
        type: AudioInputDto,
    })
    @ValidateNested()
    @Type(() => AudioInputDto)
    audio: AudioInputDto;

    @ApiProperty({
        description: 'Instruction for audio processing',
        example: 'Transcribe this audio and summarize the main points',
    })
    @IsString()
    prompt: string;

    @ApiPropertyOptional({
        description: 'System prompt for context',
    })
    @IsOptional()
    @IsString()
    system_prompt?: string;

    @ApiPropertyOptional({
        description: 'Task type',
        enum: ['transcribe', 'analyze', 'summarize', 'translate'],
        default: 'transcribe',
    })
    @IsOptional()
    @IsIn(['transcribe', 'analyze', 'summarize', 'translate'])
    task?: 'transcribe' | 'analyze' | 'summarize' | 'translate';

    @ApiPropertyOptional({
        description: 'Target language for translation',
    })
    @IsOptional()
    @IsString()
    target_language?: string;
}

export class AudioResponseDto {
    @ApiProperty({ description: 'Processing result' })
    content: string;

    @ApiPropertyOptional({ description: 'Transcription if requested' })
    transcription?: string;

    @ApiProperty({ description: 'Model used' })
    model: string;

    @ApiProperty({ description: 'Token usage' })
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };

    @ApiProperty({ description: 'Task performed' })
    task: string;

    @ApiPropertyOptional({ description: 'Audio duration in seconds' })
    audio_duration?: number;
}
