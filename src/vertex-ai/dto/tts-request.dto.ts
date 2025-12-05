import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * TTS (Text-to-Speech) DTOs for API V1
 * Uses Google Cloud TTS API
 */

/**
 * Available TTS voices
 */
export const TTS_VOICES = [
    // Standard voices
    'Aoede', 'Charon', 'Fenrir', 'Kore', 'Puck',
    // Expressive voices
    'Zephyr', 'Harmony', 'Aurora', 'Ember',
] as const;

export type TtsVoice = typeof TTS_VOICES[number];

/**
 * Single Speaker TTS Request
 */
export class SingleSpeakerTtsRequestDto {
    @IsString()
    text: string;

    @IsOptional()
    @IsString()
    voiceName?: string; // Default: Kore

    @IsOptional()
    @IsNumber()
    @Min(0.25)
    @Max(4.0)
    speakingRate?: number; // 0.25 to 4.0

    @IsOptional()
    @IsNumber()
    @Min(-20.0)
    @Max(20.0)
    pitch?: number; // -20.0 to 20.0

    @IsOptional()
    @IsNumber()
    @Min(-96.0)
    @Max(16.0)
    volumeGainDb?: number; // -96.0 to 16.0

    @IsOptional()
    @IsString()
    languageCode?: string; // Default: en-US
}

/**
 * Speaker Config for Multi-Speaker TTS
 */
export class SpeakerConfigDto {
    @IsString()
    speaker: string; // Speaker ID in the text

    @IsString()
    voiceName: string;
}

/**
 * Multi-Speaker TTS Request
 */
export class MultiSpeakerTtsRequestDto {
    @IsString()
    text: string; // Text with speaker markers like [Speaker1] and [Speaker2]

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SpeakerConfigDto)
    speakerConfigs: SpeakerConfigDto[];

    @IsOptional()
    @IsNumber()
    @Min(0.25)
    @Max(4.0)
    speakingRate?: number;

    @IsOptional()
    @IsString()
    languageCode?: string;
}

/**
 * TTS Generation Response
 */
export interface TtsGenerationResponse {
    success: boolean;
    url: string;
    publicUrl: string;
    gcsUri: string;
    filename: string;
    mimeType: string;
    duration?: number; // Estimated duration in seconds
    voiceName: string;
    speakerCount: number;
    generatedAt: string;
}

/**
 * Available Voices Response
 */
export interface AvailableVoicesResponse {
    voices: {
        name: string;
        languageCodes: string[];
        ssmlGender: string;
    }[];
}
