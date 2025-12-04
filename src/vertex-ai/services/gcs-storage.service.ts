import { Injectable, Logger } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Image Metadata untuk GCS
 */
export interface ImageMetadata {
    model: string;
    feature: string; // text-to-image, upscale, edit, etc.
    generatedAt: Date;
    prompt?: string;
    parameters?: Record<string, any>;
    userId?: string;
}

/**
 * Upload Result
 */
export interface UploadResult {
    url: string;
    filename: string;
    mimeType: string;
    generatedAt: string;
}

/**
 * GCS Storage Service
 * Handles uploading generated images to Google Cloud Storage
 */
@Injectable()
export class GcsStorageService {
    private readonly logger = new Logger(GcsStorageService.name);
    private storage: Storage;
    private bucketName: string;
    private imagePath: string;
    private enablePublicAccess: boolean;

    constructor(private readonly configService: ConfigService) {
        this.initializeStorage();
    }

    /**
     * Initialize Google Cloud Storage
     */
    private initializeStorage(): void {
        try {
            const credentialsPath = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
            const projectId = this.configService.get<string>('GOOGLE_CLOUD_PROJECT');

            // Resolve to absolute path
            const absolutePath = path.isAbsolute(credentialsPath!)
                ? credentialsPath!
                : path.resolve(process.cwd(), credentialsPath!);

            this.logger.log(`Initializing GCS with credentials: ${absolutePath}`);

            this.storage = new Storage({
                keyFilename: absolutePath,
                projectId: projectId!,
            });

            this.bucketName = this.configService.get<string>('GCS_BUCKET_NAME') || 'orenax-vertex-ai-images';
            this.imagePath = this.configService.get<string>('GCS_IMAGE_PATH') || 'images/generated';
            this.enablePublicAccess = this.configService.get<string>('GCS_ENABLE_PUBLIC_ACCESS', 'true') === 'true';

            this.logger.log(`GCS Storage initialized: bucket=${this.bucketName}, path=${this.imagePath}`);
        } catch (error) {
            this.logger.error('Failed to initialize GCS Storage:', error);
            throw error;
        }
    }

    /**
     * Upload generated image to GCS
     */
    async uploadGeneratedImage(
        base64Data: string,
        metadata: ImageMetadata,
        mimeType: string = 'image/png',
    ): Promise<UploadResult> {
        try {
            // Generate unique filename
            const filename = this.generateFilename(metadata.model, metadata.feature, mimeType);
            const filePath = `${this.imagePath}/${metadata.feature}/${filename}`;

            this.logger.log(`Uploading image to GCS: ${filePath}`);

            // Convert base64 to buffer
            const buffer = Buffer.from(base64Data, 'base64');

            // Get bucket reference
            const bucket = this.storage.bucket(this.bucketName);
            const file = bucket.file(filePath);

            // Upload file
            await file.save(buffer, {
                metadata: {
                    contentType: mimeType,
                    metadata: {
                        model: metadata.model,
                        feature: metadata.feature,
                        generatedAt: metadata.generatedAt.toISOString(),
                        prompt: metadata.prompt || '',
                        userId: metadata.userId || '',
                    },
                },
            });

            this.logger.log(`Image uploaded successfully: ${filePath}`);

            // Make public if enabled
            if (this.enablePublicAccess) {
                await this.makePublic(filePath);
            }

            // Generate public URL
            const url = this.getPublicUrl(filePath);

            return {
                url,
                filename,
                mimeType,
                generatedAt: metadata.generatedAt.toISOString(),
            };
        } catch (error) {
            this.logger.error('Failed to upload image to GCS:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }
    }

    /**
     * Upload multiple images (for batch generation)
     */
    async uploadMultipleImages(
        images: Array<{ base64Data: string; mimeType: string }>,
        metadata: ImageMetadata,
    ): Promise<UploadResult[]> {
        const uploadPromises = images.map((image) =>
            this.uploadGeneratedImage(image.base64Data, metadata, image.mimeType),
        );

        return Promise.all(uploadPromises);
    }

    /**
     * Generate unique filename
     * Format: YYYYMMDD_HHMMSS_modelId_feature_uuid.ext
     */
    private generateFilename(modelId: string, feature: string, mimeType: string): string {
        const timestamp = new Date()
            .toISOString()
            .replace(/[-:]/g, '')
            .replace('T', '_')
            .split('.')[0]; // YYYYMMDD_HHMMSS

        const modelShort = modelId
            .replace('imagen-', 'img')
            .replace('gemini-', 'gem')
            .replace('.0', '')
            .replace('-', '');

        const uuid = uuidv4().split('-')[0]; // First segment of UUID
        const extension = mimeType.split('/')[1]; // png, jpeg

        return `${timestamp}_${modelShort}_${feature}_${uuid}.${extension}`;
    }

    /**
     * Make file publicly accessible
     */
    private async makePublic(filePath: string): Promise<void> {
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const file = bucket.file(filePath);

            await file.makePublic();
            this.logger.log(`File made public: ${filePath}`);
        } catch (error) {
            this.logger.warn(`Failed to make file public: ${error.message}`);
            // Don't throw error, just warn
        }
    }

    /**
     * Get public URL for a file
     */
    private getPublicUrl(filePath: string): string {
        return `https://storage.googleapis.com/${this.bucketName}/${filePath}`;
    }

    /**
     * Delete image from GCS (optional cleanup)
     */
    async deleteImage(filename: string, feature: string): Promise<void> {
        try {
            const filePath = `${this.imagePath}/${feature}/${filename}`;
            const bucket = this.storage.bucket(this.bucketName);
            const file = bucket.file(filePath);

            await file.delete();
            this.logger.log(`Image deleted: ${filePath}`);
        } catch (error) {
            this.logger.error(`Failed to delete image: ${error.message}`);
            throw error;
        }
    }

    /**
     * Check if bucket exists
     */
    async checkBucketExists(): Promise<boolean> {
        try {
            const bucket = this.storage.bucket(this.bucketName);
            const [exists] = await bucket.exists();
            return exists;
        } catch (error) {
            this.logger.error(`Failed to check bucket: ${error.message}`);
            return false;
        }
    }
}
