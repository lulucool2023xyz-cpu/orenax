import { IsOptional, IsArray, IsString, IsBoolean, IsNumber, ValidateNested, ValidateIf } from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * Google Search Grounding Configuration
 * Enables grounding with Google Search for up-to-date information
 */
export class GoogleSearchDto {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    excludeDomains?: string[];

    @IsOptional()
    @IsBoolean()
    dynamicRetrieval?: boolean; // Enable dynamic retrieval mode
}

/**
 * Location Context for Google Maps Grounding
 */
export class LocationContextDto {
    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;
}

/**
 * Google Maps Grounding Configuration
 * Enables grounding with Google Maps for location-based information
 */
export class GoogleMapsDto {
    @IsOptional()
    @IsBoolean()
    enableWidget?: boolean; // Return Google Maps widget context token

    @IsOptional()
    @ValidateNested()
    @Type(() => LocationContextDto)
    location?: LocationContextDto; // User's location for local results

    @IsOptional()
    @IsString()
    languageCode?: string; // e.g., "en_US", "id_ID"
}

/**
 * URL Context Grounding Configuration
 * Enables grounding with specific URLs for context
 */
export class UrlContextDto {
    @IsArray()
    @IsString({ each: true })
    urls: string[];
}

/**
 * Retrieval Configuration for Grounding
 */
export class RetrievalConfigDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => LocationContextDto)
    latLng?: LocationContextDto;

    @IsOptional()
    @IsString()
    languageCode?: string;
}

/**
 * Grounding Configuration DTO
 * Comprehensive grounding support for Vertex AI
 * 
 * Supported features:
 * - Google Search: Ground with web search results
 * - Google Maps: Ground with location/place data
 * - URL Context: Ground with specific web pages
 * 
 * Usage:
 * - Simple: {"googleSearch": true}
 * - Advanced: {"googleSearch": {"dynamicRetrieval": true, "excludeDomains": ["example.com"]}}
 */
export class GroundingConfigDto {
    /**
     * Google Search grounding
     * Can be:
     * - true: Enable basic Google Search grounding
     * - object: Enable with advanced options (dynamicRetrieval, excludeDomains)
     */
    @IsOptional()
    @Transform(({ value }) => {
        // Allow boolean true or object
        if (value === true) return true;
        if (typeof value === 'object') return value;
        return undefined;
    })
    googleSearch?: boolean | GoogleSearchDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => GoogleMapsDto)
    googleMaps?: GoogleMapsDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => UrlContextDto)
    urlContext?: UrlContextDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => RetrievalConfigDto)
    retrievalConfig?: RetrievalConfigDto; // Global retrieval settings
}

