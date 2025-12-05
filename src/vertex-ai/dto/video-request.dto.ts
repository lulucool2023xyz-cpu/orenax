import { IsString, IsOptional, IsNumber, IsIn, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Veo Supported Models for Vertex AI
 */
export const VEO_MODELS = [
    'veo-3.1-generate-001',
    'veo-3.1-fast-generate-001',
    'veo-3.1-generate-preview',
    'veo-3.1-fast-generate-preview',
    'veo-3.0-generate-001',
    'veo-3.0-fast-generate-001',
    'veo-2.0-generate-001',
] as const;

export type VeoModelId = typeof VEO_MODELS[number];

/**
 * Input Image for Video Generation
 */
export class VideoInputImageDto {
    @IsOptional()
    @IsString()
    bytesBase64Encoded?: string;

    @IsOptional()
    @IsString()
    gcsUri?: string;

    @IsOptional()
    @IsString()
    mimeType?: string;
}

/**
 * Input Video for Extension
 */
export class VideoInputDto {
    @IsOptional()
    @IsString()
    bytesBase64Encoded?: string;

    @IsOptional()
    @IsString()
    gcsUri?: string;

    @IsOptional()
    @IsString()
    mimeType?: string;
}

/**
 * Reference Image for Video Generation
 */
export class VideoReferenceImageDto {
    @ValidateNested()
    @Type(() => VideoInputImageDto)
    image: VideoInputImageDto;

    @IsString()
    @IsIn(['REFERENCE_TYPE_STYLE', 'REFERENCE_TYPE_ASSET'])
    referenceType: 'REFERENCE_TYPE_STYLE' | 'REFERENCE_TYPE_ASSET';
}

/**
 * Text-to-Video Generation DTO
 */
export class TextToVideoDto {
    @IsString()
    prompt: string;

    @IsOptional()
    @IsString()
    negativePrompt?: string;

    @IsOptional()
    @IsIn([4, 5, 6, 7, 8])
    durationSeconds?: number;

    @IsOptional()
    @IsIn(['16:9', '9:16', '1:1'])
    aspectRatio?: '16:9' | '9:16' | '1:1';

    @IsOptional()
    @IsIn(['720p', '1080p', '4k'])
    resolution?: '720p' | '1080p' | '4k';

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @IsBoolean()
    generateAudio?: boolean;

    @IsOptional()
    @IsNumber()
    seed?: number;

    @IsOptional()
    @IsString()
    userId?: string; // User ID for saving to Supabase database
}

/**
 * Image-to-Video Generation DTO
 */
export class ImageToVideoDto {
    @IsString()
    prompt: string;

    @ValidateNested()
    @Type(() => VideoInputImageDto)
    image: VideoInputImageDto;

    @IsOptional()
    @IsString()
    negativePrompt?: string;

    @IsOptional()
    @IsIn([4, 5, 6, 7, 8])
    durationSeconds?: number;

    @IsOptional()
    @IsIn(['16:9', '9:16', '1:1'])
    aspectRatio?: '16:9' | '9:16' | '1:1';

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @IsIn(['fit', 'fill', 'pad'])
    resizeMode?: 'fit' | 'fill' | 'pad';

    @IsOptional()
    @IsBoolean()
    generateAudio?: boolean;
}

/**
 * Video Extension DTO
 */
export class VideoExtendDto {
    @IsString()
    prompt: string;

    @ValidateNested()
    @Type(() => VideoInputDto)
    video: VideoInputDto;

    @IsOptional()
    @IsIn([4, 5, 6, 7, 8])
    extensionSeconds?: number;

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @IsBoolean()
    generateAudio?: boolean;
}

/**
 * First-Last Frame Interpolation DTO
 */
export class FrameInterpolationDto {
    @IsString()
    prompt: string;

    @ValidateNested()
    @Type(() => VideoInputImageDto)
    firstFrame: VideoInputImageDto;

    @ValidateNested()
    @Type(() => VideoInputImageDto)
    lastFrame: VideoInputImageDto;

    @IsOptional()
    @IsIn([4, 5, 6, 7, 8])
    durationSeconds?: number;

    @IsOptional()
    @IsIn(['16:9', '9:16', '1:1'])
    aspectRatio?: '16:9' | '9:16' | '1:1';

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @IsBoolean()
    generateAudio?: boolean;
}

/**
 * Video with Reference Images DTO
 */
export class VideoWithReferencesDto {
    @IsString()
    prompt: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VideoReferenceImageDto)
    referenceImages: VideoReferenceImageDto[];

    @IsOptional()
    @ValidateNested()
    @Type(() => VideoInputImageDto)
    image?: VideoInputImageDto;

    @IsOptional()
    @IsIn([4, 5, 6, 7, 8])
    durationSeconds?: number;

    @IsOptional()
    @IsIn(['16:9', '9:16', '1:1'])
    aspectRatio?: '16:9' | '9:16' | '1:1';

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @IsBoolean()
    generateAudio?: boolean;
}

/**
 * Video Generation Response
 */
export interface VideoGenerationResponse {
    success: boolean;
    url: string;
    gcsUri: string;
    filename: string;
    prompt: string;
    model: string;
    duration: number;
    resolution: string;
    aspectRatio: string;
    hasAudio?: boolean;
    generatedAt: string;
    operationId?: string;
}

/**
 * Video Operation Status
 */
export interface VideoOperationStatus {
    operationId: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    progress?: number;
    result?: VideoGenerationResponse;
    error?: string;
}
