import { IsString, IsOptional, IsNumber, IsInt, Min, Max } from 'class-validator';

/**
 * Lyria Music Generation DTOs for API V1
 * Model: lyria-002
 * Output: 32.8s WAV at 48kHz (instrumental only)
 */

/**
 * Lyria Music Generation Request
 */
export class LyriaMusicGenerationDto {
    @IsString()
    prompt: string;

    @IsOptional()
    @IsString()
    negativePrompt?: string;

    @IsOptional()
    @IsNumber()
    seed?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(4)
    sampleCount?: number; // Cannot use with seed
}

/**
 * Music Generation Response
 */
export interface MusicGenerationResponse {
    success: boolean;
    tracks: MusicTrack[];
    model: string;
    generatedAt: string;
}

/**
 * Single Music Track
 */
export interface MusicTrack {
    url: string;
    publicUrl: string;
    gcsUri: string;
    filename: string;
    mimeType: string;
    duration: number; // 32.8 seconds
    sampleRate: number; // 48000 Hz
    prompt: string;
}
