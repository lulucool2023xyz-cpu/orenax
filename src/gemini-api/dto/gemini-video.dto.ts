import { IsString, IsOptional, IsNumber, IsIn, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Veo Supported Models
 */
export const VEO_MODELS = [
    'veo-3.1-generate-001',
    'veo-3.1-fast-generate-001',
    'veo-3.1-generate-preview',
    'veo-3.1-fast-generate-preview',
    'veo-3.0-generate-001',
    'veo-3.0-fast-generate-001',
    'veo-3.0-generate-exp',
    'veo-2.0-generate-001',
    'veo-2.0-generate-exp',
    'veo-2.0-generate-preview',
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
    mimeType?: string; // image/png, image/jpeg
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
    mimeType?: string; // video/mp4
}

/**
 * Reference Image for Video Generation
 * Supports style and asset references
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
 * Video Generation DTO - Text-to-Video
 */
export class GeminiVideoGenerationDto {
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
    generateAudio?: boolean; // Generate audio with video

    @IsOptional()
    @IsNumber()
    seed?: number;

    @IsOptional()
    @IsIn(['low', 'medium', 'high'])
    compressionQuality?: 'low' | 'medium' | 'high';

    @IsOptional()
    @IsString()
    userId?: string; // For database tracking
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
    resizeMode?: 'fit' | 'fill' | 'pad'; // Veo 3 only

    @IsOptional()
    @IsBoolean()
    generateAudio?: boolean;
}

/**
 * Video Extension DTO
 * Extend an existing Veo-generated video
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
 * Generate video between two frames
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
 * Video Generation with Reference Images DTO
 * Use style or asset references to guide video generation
 */
export class VideoWithReferencesDto {
    @IsString()
    prompt: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VideoReferenceImageDto)
    referenceImages: VideoReferenceImageDto[]; // Max 3 asset or 1 style

    @IsOptional()
    @ValidateNested()
    @Type(() => VideoInputImageDto)
    image?: VideoInputImageDto; // Optional first frame

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
    url: string; // GCS public URL
    gcsUri: string; // gs://bucket/path
    filename: string;
    prompt: string;
    model: string;
    duration: number;
    resolution: string;
    aspectRatio: string;
    hasAudio?: boolean;
    generatedAt: string;
    operationId?: string; // For tracking long-running operations
}

/**
 * Video Operation Status
 */
export interface VideoOperationStatus {
    operationId: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    progress?: number; // 0-100
    result?: VideoGenerationResponse;
    error?: string;
}
