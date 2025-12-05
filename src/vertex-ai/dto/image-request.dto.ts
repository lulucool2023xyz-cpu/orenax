import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsEnum, IsObject, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Output Options DTO
 * Used for image generation output configuration
 */
export class OutputOptionsDto {
    @IsOptional()
    @IsEnum(['image/png', 'image/jpeg'])
    mimeType?: 'image/png' | 'image/jpeg';

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    compressionQuality?: number; // JPEG compression quality (0-100)
}

/**
 * Text-to-Image Generation DTO
 * Generates images from text prompts using Vertex AI Imagen
 */
export class TextToImageDto {
    @IsOptional()
    @IsString()
    model?: string; // Default: imagen-3.0-generate-001

    @IsString()
    prompt: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(4)
    sampleCount?: number; // Number of images to generate (1-4)

    @IsOptional()
    @IsBoolean()
    addWatermark?: boolean; // Default: true

    @IsOptional()
    @IsNumber()
    seed?: number; // Random seed (not available if addWatermark=true)

    @IsOptional()
    @IsString()
    negativePrompt?: string;

    @IsOptional()
    @IsString()
    aspectRatio?: string; // Default: "1:1" - supports "1:1", "9:16", "16:9", "3:4", "4:3"

    @IsOptional()
    @IsBoolean()
    enhancePrompt?: boolean; // Use LLM-based prompt rewriting for better quality

    @IsOptional()
    @IsString()
    language?: string; // Language code: auto, en, zh, zh-TW, hi, ja, ko, pt, es

    @IsOptional()
    @IsString()
    sampleImageSize?: string; // Output resolution: "1K" or "2K"

    @IsOptional()
    @ValidateNested()
    @Type(() => OutputOptionsDto)
    outputOptions?: OutputOptionsDto;

    @IsOptional()
    @IsString()
    storageUri?: string; // GCS URI for storing generated images

    @IsOptional()
    @IsEnum(['block_low_and_above', 'block_medium_and_above', 'block_only_high', 'block_none'])
    safetySetting?: string;

    @IsOptional()
    @IsEnum(['dont_allow', 'allow_adult', 'allow_all'])
    personGeneration?: string;

    @IsOptional()
    @IsString()
    userId?: string; // User ID for saving to Supabase database
}

/**
 * Image Upscale DTO
 * Upscales images to higher resolutions
 */
export class ImageUpscaleDto {
    @IsString()
    image: string; // Base64 encoded image or GCS URI

    @IsOptional()
    @IsEnum(['x2', 'x3', 'x4'])
    upscaleFactor?: 'x2' | 'x3' | 'x4'; // Default: x2

    @IsOptional()
    @IsString()
    prompt?: string; // Optional prompt (default: "Upscale the image")

    @IsOptional()
    @IsBoolean()
    addWatermark?: boolean; // Default: true

    @IsOptional()
    @ValidateNested()
    @Type(() => OutputOptionsDto)
    outputOptions?: OutputOptionsDto;

    @IsOptional()
    @IsString()
    storageUri?: string; // GCS URI for storing output
}

/**
 * Mask Image Config DTO
 * Configuration for mask images in image editing
 */
export class MaskImageConfigDto {
    @IsOptional()
    @IsEnum(['MASK_MODE_USER_PROVIDED', 'MASK_MODE_BACKGROUND', 'MASK_MODE_FOREGROUND', 'MASK_MODE_SEMANTIC'])
    maskMode?: string;

    @IsOptional()
    @IsNumber()
    dilation?: number; // Dilation factor (0.0 - 1.0)
}

/**
 * Reference Image DTO
 * Used for image editing and customization
 */
export class ReferenceImageDto {
    @IsString()
    referenceType: string; // REFERENCE_TYPE_RAW, REFERENCE_TYPE_MASK, etc.

    @IsNumber()
    referenceId: number;

    @IsString()
    bytesBase64Encoded: string; // Base64 encoded image

    @IsOptional()
    @ValidateNested()
    @Type(() => MaskImageConfigDto)
    maskImageConfig?: MaskImageConfigDto;

    @IsOptional()
    @IsObject()
    controlImageConfig?: any; // Control image config for customization

    @IsOptional()
    @IsObject()
    subjectImageConfig?: any; // Subject image config for customization
}

/**
 * Image Edit DTO
 * Edits images using masks and prompts
 */
export class ImageEditDto {
    @IsOptional()
    @IsString()
    prompt?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReferenceImageDto)
    referenceImages: ReferenceImageDto[];

    @IsString()
    editMode: string; // EDIT_MODE_INPAINT_REMOVAL, EDIT_MODE_INPAINT_INSERTION, etc.

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(75)
    baseSteps?: number; // Sampling steps (1-75)

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(500)
    guidanceScale?: number; // Prompt adherence (0-500)

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(4)
    sampleCount?: number;

    @IsOptional()
    @IsBoolean()
    addWatermark?: boolean;
}

/**
 * Image Customize DTO
 * Customizes images using reference images
 */
export class ImageCustomizeDto {
    @IsString()
    prompt: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ReferenceImageDto)
    referenceImages: ReferenceImageDto[]; // Max 4 reference images

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(4)
    sampleCount?: number;

    @IsOptional()
    @IsString()
    negativePrompt?: string;

    @IsOptional()
    @IsNumber()
    seed?: number;
}

/**
 * Virtual Try-On DTO
 * Virtual try-on for clothing products
 */
export class VirtualTryOnDto {
    @IsString()
    personImage: string; // Base64 encoded person image or GCS URI

    @IsArray()
    @IsString({ each: true })
    productImages: string[]; // Array of product images (base64 or GCS URI)

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(4)
    sampleCount?: number;

    @IsOptional()
    @IsNumber()
    baseSteps?: number; // Sampling steps (default: 32)

    @IsOptional()
    @IsBoolean()
    addWatermark?: boolean;

    @IsOptional()
    @ValidateNested()
    @Type(() => OutputOptionsDto)
    outputOptions?: OutputOptionsDto;

    @IsOptional()
    @IsString()
    storageUri?: string;
}

/**
 * Product Recontextualization DTO
 * Recontextualizes product images into different scenes
 */
export class ProductRecontextDto {
    @IsOptional()
    @IsString()
    prompt?: string;

    @IsArray()
    @IsString({ each: true })
    productImages: string[]; // Max 3 product images

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(4)
    sampleCount?: number;

    @IsOptional()
    @IsBoolean()
    addWatermark?: boolean;

    @IsOptional()
    @IsBoolean()
    enhancePrompt?: boolean; // Use LLM-based prompt rewriting

    @IsOptional()
    @IsEnum(['block_low_and_above', 'block_medium_and_above', 'block_only_high', 'block_none'])
    safetySetting?: string;

    @IsOptional()
    @IsEnum(['dont_allow', 'allow_adult', 'allow_all'])
    personGeneration?: string;
}
