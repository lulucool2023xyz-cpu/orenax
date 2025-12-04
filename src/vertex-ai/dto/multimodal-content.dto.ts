import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';

/**
 * Multimodal content types
 */
export enum MultimodalContentType {
    TEXT = 'text',
    IMAGE = 'image',
    AUDIO = 'audio',
    VIDEO = 'video',
    PDF = 'pdf',
}

/**
 * Multimodal Content DTO
 * Supports various input types for Gemini models
 */
export class MultimodalContentDto {
    /**
     * Content type
     */
    @IsEnum(MultimodalContentType)
    type: MultimodalContentType;

    /**
     * Content data
     * For text: the actual text
     * For files: base64 encoded data OR file URI (gs://... or https://...)
     */
    @IsString()
    @IsNotEmpty()
    data: string;

    /**
     * MIME type for file content
     * Required for non-text types
     */
    @IsOptional()
    @IsString()
    mimeType?: string;
}

/**
 * File Upload DTO
 * For multipart file uploads
 */
export class FileUploadDto {
    /**
     * File buffer (from multer)
     */
    buffer: Buffer;

    /**
     * Original filename
     */
    originalname: string;

    /**
     * MIME type
     */
    mimetype: string;

    /**
     * File size in bytes
     */
    size: number;
}
