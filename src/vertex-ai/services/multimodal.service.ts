import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { MultimodalContentDto, MultimodalContentType, FileUploadDto } from '../dto/multimodal-content.dto';
import { Part, Blob, FileData } from '../types/vertex-ai.types';
import { SUPPORTED_MIME_TYPES } from '../types/constants';

/**
 * Multimodal Service
 * Handles various content types for Gemini models
 */
@Injectable()
export class MultimodalService {
    private readonly logger = new Logger(MultimodalService.name);

    /**
     * Convert multimodal content to Vertex AI Part format
     */
    convertToPartobjects(contents: MultimodalContentDto[]): Part[] {
        return contents.map(content => this.convertToPart(content));
    }

    /**
     * Convert single multimodal content to Part
     */
    private convertToPart(content: MultimodalContentDto): Part {
        switch (content.type) {
            case MultimodalContentType.TEXT:
                return { text: content.data };

            case MultimodalContentType.IMAGE:
            case MultimodalContentType.AUDIO:
            case MultimodalContentType.VIDEO:
            case MultimodalContentType.PDF:
                return this.convertFileToPart(content);

            default:
                throw new BadRequestException(`Unsupported content type: ${content.type}`);
        }
    }

    /**
     * Convert file content to Part (inline or URI)
     */
    private convertFileToPart(content: MultimodalContentDto): Part {
        const mimeType = content.mimeType || this.detectMimeType(content.type);

        // Check if data is a URI (gs:// or https://)
        if (content.data.startsWith('gs://') || content.data.startsWith('https://')) {
            return {
                fileData: {
                    mimeType,
                    fileUri: content.data,
                } as FileData,
            };
        }

        // Otherwise, treat as base64 inline data
        return {
            inlineData: {
                mimeType,
                data: content.data, // base64 encoded
            } as Blob,
        };
    }

    /**
     * Process file upload to base64
     */
    convertFileUploadToBase64(file: FileUploadDto): string {
        return file.buffer.toString('base64');
    }

    /**
     * Create multimodal content from file upload
     */
    createContentFromFile(file: FileUploadDto): MultimodalContentDto {
        const contentType = this.detectContentType(file.mimetype);
        const base64Data = this.convertFileUploadToBase64(file);

        return {
            type: contentType,
            data: base64Data,
            mimeType: file.mimetype,
        };
    }

    /**
     * Validate file upload
     */
    validateFileUpload(file: FileUploadDto): void {
        const contentType = this.detectContentType(file.mimetype);

        // Check MIME type is supported
        const supported = this.isMimeTypeSupported(file.mimetype);
        if (!supported) {
            throw new BadRequestException(
                `Unsupported file type: ${file.mimetype}. File type must be one of: ${this.getSupportedMimeTypes(contentType).join(', ')}`
            );
        }

        // Check file size (max 20MB for images, 100MB for audio/video)
        const maxSize = this.getMaxFileSize(contentType);
        if (file.size > maxSize) {
            throw new BadRequestException(
                `File too large. Maximum size for ${contentType}: ${maxSize / 1024 / 1024}MB`
            );
        }

        this.logger.log(`Validated file upload: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);
    }

    /**
     * Detect content type from MIME type
     */
    private detectContentType(mimeType: string): MultimodalContentType {
        if (mimeType.startsWith('image/')) {
            return MultimodalContentType.IMAGE;
        } else if (mimeType.startsWith('audio/')) {
            return MultimodalContentType.AUDIO;
        } else if (mimeType.startsWith('video/')) {
            return MultimodalContentType.VIDEO;
        } else if (mimeType === 'application/pdf') {
            return MultimodalContentType.PDF;
        } else {
            throw new BadRequestException(`Cannot detect content type for MIME type: ${mimeType}`);
        }
    }

    /**
     * Detect MIME type from content type
     */
    private detectMimeType(contentType: MultimodalContentType): string {
        switch (contentType) {
            case MultimodalContentType.IMAGE:
                return 'image/png';
            case MultimodalContentType.AUDIO:
                return 'audio/wav';
            case MultimodalContentType.VIDEO:
                return 'video/mp4';
            case MultimodalContentType.PDF:
                return 'application/pdf';
            default:
                return 'text/plain';
        }
    }

    /**
     * Check if MIME type is supported
     */
    private isMimeTypeSupported(mimeType: string): boolean {
        const allSupported = [
            ...SUPPORTED_MIME_TYPES.IMAGE,
            ...SUPPORTED_MIME_TYPES.AUDIO,
            ...SUPPORTED_MIME_TYPES.VIDEO,
            ...SUPPORTED_MIME_TYPES.PDF,
            ...SUPPORTED_MIME_TYPES.TEXT,
        ];

        return allSupported.includes(mimeType);
    }

    /**
     * Get supported MIME types for content type
     */
    private getSupportedMimeTypes(contentType: MultimodalContentType): string[] {
        switch (contentType) {
            case MultimodalContentType.IMAGE:
                return SUPPORTED_MIME_TYPES.IMAGE;
            case MultimodalContentType.AUDIO:
                return SUPPORTED_MIME_TYPES.AUDIO;
            case MultimodalContentType.VIDEO:
                return SUPPORTED_MIME_TYPES.VIDEO;
            case MultimodalContentType.PDF:
                return SUPPORTED_MIME_TYPES.PDF;
            default:
                return SUPPORTED_MIME_TYPES.TEXT;
        }
    }

    /**
     * Get max file size for content type
     */
    private getMaxFileSize(contentType: MultimodalContentType): number {
        switch (contentType) {
            case MultimodalContentType.IMAGE:
                return 20 * 1024 * 1024; // 20MB
            case MultimodalContentType.AUDIO:
            case MultimodalContentType.VIDEO:
                return 100 * 1024 * 1024; // 100MB
            case MultimodalContentType.PDF:
                return 50 * 1024 * 1024; // 50MB
            default:
                return 10 * 1024 * 1024; // 10MB
        }
    }

    /**
     * Extract text from multimodal contents
     */
    extractTextContent(contents: MultimodalContentDto[]): string {
        return contents
            .filter(c => c.type === MultimodalContentType.TEXT)
            .map(c => c.data)
            .join('\n');
    }

    /**
     * Count multimodal contents by type
     */
    countContentsByType(contents: MultimodalContentDto[]): Record<string, number> {
        const counts: Record<string, number> = {};

        for (const content of contents) {
            counts[content.type] = (counts[content.type] || 0) + 1;
        }

        return counts;
    }

    /**
     * Validate multimodal contents array
     */
    validateMultimodalContents(contents: MultimodalContentDto[]): void {
        if (!contents || contents.length === 0) {
            throw new BadRequestException('Multimodal contents cannot be empty');
        }

        // Must have at least one text content
        const hasText = contents.some(c => c.type === MultimodalContentType.TEXT);
        if (!hasText) {
            throw new BadRequestException('Multimodal contents must include at least one text message');
        }

        // Validate each content
        for (const content of contents) {
            if (!content.data || content.data.trim() === '') {
                throw new BadRequestException('Content data cannot be empty');
            }

            // Validate MIME type for non-text content
            if (content.type !== MultimodalContentType.TEXT && !content.mimeType) {
                // Auto-detect if not provided
                content.mimeType = this.detectMimeType(content.type);
            }
        }

        this.logger.log(`Validated ${contents.length} multimodal contents: ${JSON.stringify(this.countContentsByType(contents))}`);
    }
}
