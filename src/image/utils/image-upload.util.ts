import { BadRequestException } from '@nestjs/common';
import { FileUploadDto } from '../../vertex-ai/dto/multimodal-content.dto';

/**
 * Image Upload Utility
 * Helper functions for handling image file uploads
 */
export class ImageUploadUtil {
    /**
     * Convert file buffer to base64 string
     */
    static convertToBase64(file: FileUploadDto): string {
        return file.buffer.toString('base64');
    }

    /**
     * Validate image file
     */
    static validateImageFile(file: FileUploadDto): void {
        const allowedMimeTypes = [
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/webp',
            'image/gif',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `Unsupported image type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(', ')}`,
            );
        }

        // Max 20MB for images
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxSize) {
            throw new BadRequestException(`File too large. Maximum size: 20MB`);
        }
    }

    /**
     * Convert Express Multer file to FileUploadDto
     */
    static fromExpressFile(file: Express.Multer.File): FileUploadDto {
        return {
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        };
    }
}

