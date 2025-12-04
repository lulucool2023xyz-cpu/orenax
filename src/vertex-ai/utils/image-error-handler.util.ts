import { BadRequestException, Logger } from '@nestjs/common';

/**
 * Safety Filter Error Codes Mapping
 * Maps Vertex AI RAI error codes to their categories
 */
export const SAFETY_ERROR_CODES: Record<number, { category: string; description: string; filteredOn: string }> = {
    // Child Content
    58061214: { category: 'Child', description: 'Child content detected in prompt', filteredOn: 'input' },
    17301594: { category: 'Child', description: 'Child content detected in output', filteredOn: 'output' },

    // Celebrity
    29310472: { category: 'Celebrity', description: 'Celebrity detected in prompt', filteredOn: 'input' },
    15236754: { category: 'Celebrity', description: 'Celebrity detected in output', filteredOn: 'output' },

    // Dangerous Content
    62263041: { category: 'Dangerous', description: 'Dangerous content detected', filteredOn: 'input' },

    // Hate
    57734940: { category: 'Hate', description: 'Hate content in prompt', filteredOn: 'input' },
    22137204: { category: 'Hate', description: 'Hate content in output', filteredOn: 'output' },

    // Other
    74803281: { category: 'Other', description: 'Miscellaneous safety issue (output)', filteredOn: 'output' },
    29578790: { category: 'Other', description: 'Miscellaneous safety issue (output)', filteredOn: 'output' },
    42876398: { category: 'Other', description: 'Miscellaneous safety issue (input)', filteredOn: 'input' },

    // People/Face
    39322892: { category: 'People/Face', description: 'Person/face not allowed', filteredOn: 'output' },

    // Personal Information
    92201652: { category: 'Personal Info', description: 'PII detected in prompt', filteredOn: 'input' },

    // Prohibited Content
    89371032: { category: 'Prohibited', description: 'Prohibited content in prompt', filteredOn: 'input' },
    49114662: { category: 'Prohibited', description: 'Prohibited content in output', filteredOn: 'output' },
    72817394: { category: 'Prohibited', description: 'Prohibited content in output', filteredOn: 'output' },

    // Sexual Content
    90789179: { category: 'Sexual', description: 'Sexual content in prompt', filteredOn: 'input' },
    63429089: { category: 'Sexual', description: 'Sexual content in output', filteredOn: 'output' },
    43188360: { category: 'Sexual', description: 'Sexual content in output', filteredOn: 'output' },

    // Toxic
    78610348: { category: 'Toxic', description: 'Toxic content in prompt', filteredOn: 'input' },

    // Violence
    61493863: { category: 'Violence', description: 'Violence in prompt', filteredOn: 'input' },
    56562880: { category: 'Violence', description: 'Violence in output', filteredOn: 'output' },

    // Vulgar
    32635315: { category: 'Vulgar', description: 'Vulgar content in prompt', filteredOn: 'input' },

    // Celebrity or Child
    64151117: { category: 'Celebrity/Child', description: 'Photorealistic celebrity or child', filteredOn: 'input/output' },
};

/**
 * Image Generation Error Handler
 * Handles errors dari Vertex AI Imagen API
 */
export class ImageErrorHandler {
    private static readonly logger = new Logger('ImageErrorHandler');

    /**
     * Handle safety filter error
     */
    static handleSafetyFilterError(raiReason: string): BadRequestException {
        // Extract error code from RAI reason
        // Format: "ERROR_MESSAGE. Support codes: 56562880"
        const errorCode = this.extractErrorCode(raiReason);
        const errorInfo = errorCode ? SAFETY_ERROR_CODES[errorCode] : null;

        const message = errorInfo
            ? `Request blocked by safety filters: ${errorInfo.description}`
            : 'Request blocked by safety filters';

        this.logger.warn(`Safety filter blocked request: ${raiReason}`);
        this.logger.warn(`Error code: ${errorCode}, Category: ${errorInfo?.category || 'Unknown'}`);

        throw new BadRequestException({
            success: false,
            statusCode: 400,
            message,
            raiFilteredReason: raiReason,
            errorCode,
            category: errorInfo?.category || 'Unknown',
            filteredOn: errorInfo?.filteredOn || 'unknown',
            hint: this.getSafetyHint(errorInfo?.category),
        });
    }

    /**
     * Handle Vertex AI API error
     */
    static handleVertexAiError(error: any): never {
        this.logger.error('Vertex AI API Error:', error);

        // Check if it's a safety filter error
        if (error.message?.includes('Support codes:') || error.message?.includes('raiFilteredReason')) {
            this.handleSafetyFilterError(error.message);
        }

        // Check for quota exceeded
        if (error.code === 8 || error.message?.includes('Quota exceeded')) {
            throw new BadRequestException({
                success: false,
                statusCode: 429,
                message: 'API quota exceeded. Please try again later.',
                error: 'QUOTA_EXCEEDED',
            });
        }

        // Check for invalid model
        if (error.message?.includes('model') && error.message?.includes('not found')) {
            throw new BadRequestException({
                success: false,
                statusCode: 400,
                message: 'Invalid model ID. Please check supported models.',
                error: 'INVALID_MODEL',
            });
        }

        // Check for invalid parameters
        if (error.code === 3 || error.message?.includes('INVALID_ARGUMENT')) {
            throw new BadRequestException({
                success: false,
                statusCode: 400,
                message: error.message || 'Invalid request parameters',
                error: 'INVALID_ARGUMENT',
            });
        }

        // General error
        throw new BadRequestException({
            success: false,
            statusCode: 500,
            message: 'Failed to generate image',
            error: error.message || 'Internal server error',
        });
    }

    /**
     * Handle GCS upload error
     */
    static handleGcsError(error: any): never {
        this.logger.error('GCS Upload Error:', error);

        throw new BadRequestException({
            success: false,
            statusCode: 500,
            message: 'Failed to upload image to storage',
            error: error.message,
            hint: 'Check GCS bucket permissions and configuration',
        });
    }

    /**
     * Extract error code from RAI reason string
     */
    private static extractErrorCode(raiReason: string): number | null {
        const match = raiReason.match(/Support codes?: (\d+)/i);
        return match ? parseInt(match[1], 10) : null;
    }

    /**
     * Get safety hint based on category
     */
    private static getSafetyHint(category?: string): string {
        const hints: Record<string, string> = {
            Child: 'Avoid prompts or images depicting children',
            Celebrity: 'Avoid requesting photorealistic images of celebrities',
            Violence: 'Avoid violent or graphic content in prompts',
            Sexual: 'Avoid sexually explicit content',
            Hate: 'Avoid hateful or discriminatory content',
            Toxic: 'Use respectful and positive language',
            Prohibited: 'Review content guidelines and avoid prohibited topics',
            'Personal Info': 'Do not include personal information (PII) in prompts',
            Dangerous: 'Avoid dangerous or harmful content',
            'People/Face': 'Check personGeneration settings if you want to include people',
        };

        return hints[category || ''] || 'Please review your prompt and try again with different content';
    }

    /**
     * Log image generation attempt
     */
    static logGenerationAttempt(feature: string, model: string, params: any): void {
        this.logger.log(`Image Generation: feature=${feature}, model=${model}`);
        this.logger.debug(`Parameters: ${JSON.stringify(params)}`);
    }

    /**
     * Log successful generation
     */
    static logGenerationSuccess(feature: string, imageCount: number): void {
        this.logger.log(`✓ Generated ${imageCount} image(s) for ${feature}`);
    }
}
