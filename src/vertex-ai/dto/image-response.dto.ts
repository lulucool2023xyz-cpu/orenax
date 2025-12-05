/**
 * Image Response DTOs
 * Response structures untuk Image Generation API dengan GCS URLs
 */

/**
 * Single Generated Image
 */
export class GeneratedImageDto {
    url: string; // Public GCS URL (same as publicUrl for backward compatibility)
    publicUrl: string; // Public HTTPS URL
    gcsUri: string; // GCS URI (gs://bucket/path)
    filename: string;
    mimeType: string;
    generatedAt: string;
}

/**
 * Image Generation Success Response
 */
export class ImageGenerationResponseDto {
    success: true;
    model: string;
    images: GeneratedImageDto[];
}

/**
 * Safety Filter Error Response
 */
export class SafetyFilterErrorDto {
    success: false;
    statusCode: 400;
    message: string;
    raiFilteredReason: string; // e.g., "Support codes: 56562880"
    errorCode?: number; // Safety error code
    category?: string; // Error category (Violence, Child, etc.)
}

/**
 * General Error Response
 */
export class ImageErrorResponseDto {
    success: false;
    statusCode: number;
    message: string;
    error?: string;
    details?: any;
}

/**
 * Type for all possible image API responses
 */
export type ImageApiResponse =
    | ImageGenerationResponseDto
    | SafetyFilterErrorDto
    | ImageErrorResponseDto;
