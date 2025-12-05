import { IsArray, IsOptional, IsNumber, IsString, ValidateNested, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Weighted Prompt for Lyria music generation
 */
export class WeightedPromptDto {
    @IsString()
    text: string;

    @IsNumber()
    @Min(0.1)
    @Max(2.0)
    weight: number;
}

/**
 * Music Generation DTO for Lyria API v2
 */
export class GeminiMusicGenerationDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WeightedPromptDto)
    prompts: WeightedPromptDto[];

    @IsOptional()
    @IsNumber()
    @Min(5)
    @Max(120)
    durationSeconds?: number; // Default: 30

    @IsOptional()
    @IsNumber()
    @Min(60)
    @Max(200)
    bpm?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    density?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    brightness?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(3)
    temperature?: number;

    @IsOptional()
    @IsString()
    @IsIn([
        'C_MAJOR_A_MINOR',
        'D_FLAT_MAJOR_B_FLAT_MINOR',
        'D_MAJOR_B_MINOR',
        'E_FLAT_MAJOR_C_MINOR',
        'E_MAJOR_D_FLAT_MINOR',
        'F_MAJOR_D_MINOR',
        'G_FLAT_MAJOR_E_FLAT_MINOR',
        'G_MAJOR_E_MINOR',
        'A_FLAT_MAJOR_F_MINOR',
        'A_MAJOR_G_FLAT_MINOR',
        'B_FLAT_MAJOR_G_MINOR',
        'B_MAJOR_A_FLAT_MINOR',
    ])
    scale?: string;

    @IsOptional()
    @IsString()
    userId?: string; // For database tracking
}

/**
 * Music Generation Response
 */
export interface MusicGenerationResponse {
    url: string;
    filename: string;
    prompts: Array<{ text: string; weight: number }>;
    config: {
        bpm?: number;
        duration: number;
        scale?: string;
    };
    generatedAt: string;
}
