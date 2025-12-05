import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Voice configuration for a speaker
 */
export class SpeakerConfig {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    voiceName: string;
}

/**
 * Single Speaker TTS Request
 */
export class SingleSpeakerTtsDto {
    @IsNotEmpty()
    @IsString()
    text: string;

    @IsNotEmpty()
    @IsString()
    voiceName: string;

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @IsBoolean()
    uploadToGcs?: boolean;

    @IsOptional()
    @IsString()
    userId?: string; // For database tracking
}

/**
 * Multi-Speaker TTS Request
 */
export class MultiSpeakerTtsDto {
    @IsNotEmpty()
    @IsString()
    text: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SpeakerConfig)
    speakers: SpeakerConfig[];

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @IsBoolean()
    uploadToGcs?: boolean;

    @IsOptional()
    @IsString()
    userId?: string; // For database tracking
}

/**
 * TTS Response
 */
export interface TtsResponse {
    url?: string;
    base64Data?: string;
    filename?: string;
    text: string;
    voice?: string;
    speakers?: SpeakerConfig[];
    model: string;
    duration?: number;
    generatedAt: string;
}

/**
 * Voice info
 */
export interface VoiceInfo {
    name: string;
    tone: string;
    gender: string;
}

/**
 * Available voices list response
 */
export interface VoicesResponse {
    voices: VoiceInfo[];
    total: number;
}

/**
 * TTS Service status response
 */
export interface TtsStatusResponse {
    available: boolean;
    models: string[];
    features: {
        maxSpeakers: number;
        maxInputTokens: number;
        outputFormat: string;
        languagesSupported: number;
    };
}
