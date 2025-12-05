import { IsString, IsOptional, IsArray, IsEnum, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Response Modalities for Gemini Image Generation
 */
export enum ResponseModality {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
}

/**
 * Gemini Image Generation Request DTO
 * Uses gemini-2.5-flash-image or gemini-3-pro-image-preview
 */
export class GeminiImageGenerateDto {
    @IsString()
    prompt: string;

    @IsOptional()
    @IsString()
    model?: string; // gemini-2.5-flash-image | gemini-3-pro-image-preview

    @IsOptional()
    @IsArray()
    @IsEnum(ResponseModality, { each: true })
    responseModalities?: ResponseModality[]; // Default: [TEXT, IMAGE]

    @IsOptional()
    @IsNumber()
    sampleCount?: number; // 1-4

    @IsOptional()
    @IsString()
    negativePrompt?: string;

    @IsOptional()
    @IsNumber()
    temperature?: number; // 0.0-2.0, default 1.0

    @IsOptional()
    @IsNumber()
    topP?: number;

    @IsOptional()
    @IsNumber()
    topK?: number;
}

/**
 * Gemini Interleaved Generation Request DTO
 * Generate text and images together (e.g., illustrated recipes)
 */
export class GeminiInterleavedGenerateDto {
    @IsString()
    prompt: string;

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @IsNumber()
    maxImages?: number; // Max images to generate in response

    @IsOptional()
    @IsNumber()
    temperature?: number;
}

/**
 * Input Image for Editing
 */
export class GeminiInputImageDto {
    @IsOptional()
    @IsString()
    base64?: string; // Base64 encoded image

    @IsOptional()
    @IsString()
    gcsUri?: string; // GCS URI (gs://bucket/path)

    @IsOptional()
    @IsString()
    mimeType?: string; // image/png, image/jpeg
}

/**
 * Gemini Image Edit Request DTO
 * Edit images using conversation-style prompts
 */
export class GeminiImageEditDto {
    @IsString()
    prompt: string; // e.g., "Make it look like a cartoon"

    @ValidateNested()
    @Type(() => GeminiInputImageDto)
    image: GeminiInputImageDto;

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @IsArray()
    @IsEnum(ResponseModality, { each: true })
    responseModalities?: ResponseModality[];
}

/**
 * Multi-turn Edit Context
 * For continuing image editing in conversation
 */
export class EditContextDto {
    @IsString()
    conversationId: string;

    @IsOptional()
    @IsArray()
    previousImages?: GeminiInputImageDto[];

    @IsOptional()
    @IsString()
    thoughtSignature?: string; // For Gemini 3 Pro Image
}

/**
 * Gemini Multi-turn Image Edit Request DTO
 */
export class GeminiMultiTurnEditDto {
    @IsString()
    prompt: string;

    @ValidateNested()
    @Type(() => EditContextDto)
    context: EditContextDto;

    @IsOptional()
    @IsString()
    model?: string;
}

/**
 * Generated Image Response
 */
export class GeneratedImageDto {
    base64Data: string;
    mimeType: string;
    gcsUri?: string;
    publicUrl?: string;
}

/**
 * Text Part in Interleaved Response
 */
export class TextPartDto {
    type: 'text';
    content: string;
}

/**
 * Image Part in Interleaved Response
 */
export class ImagePartDto {
    type: 'image';
    base64Data: string;
    mimeType: string;
    gcsUri?: string;
    publicUrl?: string;
}

/**
 * Gemini Image Generation Response DTO
 */
export class GeminiImageResponseDto {
    success: boolean;
    model: string;
    images?: GeneratedImageDto[];
    text?: string;
    interleavedContent?: (TextPartDto | ImagePartDto)[];
    thoughtSignature?: string; // For multi-turn editing
    usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
    };
    error?: string;
}
