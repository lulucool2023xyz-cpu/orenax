import { IsOptional, IsArray, IsString, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Google Search Grounding Configuration
 */
export class GoogleSearchDto {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    excludeDomains?: string[];
}

/**
 * Google Maps Grounding Configuration
 */
export class GoogleMapsDto {
    @IsOptional()
    @IsBoolean()
    enableWidget?: boolean;
}

/**
 * URL Context Grounding Configuration
 */
export class UrlContextDto {
    @IsArray()
    @IsString({ each: true })
    urls: string[];
}

/**
 * Grounding Configuration DTO
 * Phase 3: Grounding features
 */
export class GroundingConfigDto {
    @IsOptional()
    @ValidateNested()
    @Type(() => GoogleSearchDto)
    googleSearch?: GoogleSearchDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => GoogleMapsDto)
    googleMaps?: GoogleMapsDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => UrlContextDto)
    urlContext?: UrlContextDto;
}
