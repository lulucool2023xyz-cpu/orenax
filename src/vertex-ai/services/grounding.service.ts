import { Injectable, Logger } from '@nestjs/common';
import {
    GroundingConfigDto,
    GoogleSearchDto,
    GoogleMapsDto,
    UrlContextDto
} from '../dto/grounding.dto';

/**
 * Grounding Service
 * Implements Google Search, Google Maps, and URL Context grounding for Vertex AI
 * 
 * Supported Models:
 * - Gemini 2.5 Pro/Flash
 * - Gemini 2.0 Flash
 * - Gemini 3 Pro (preview)
 */
@Injectable()
export class GroundingService {
    private readonly logger = new Logger(GroundingService.name);

    /**
     * Prepare grounding tools for Vertex AI request
     * Returns tools array in the correct format for the @google-cloud/aiplatform API
     * 
     * Per docs: use google_search field, format: { googleSearch: {} }
     */
    prepareGroundingTools(groundingConfig?: GroundingConfigDto): any[] | undefined {
        if (!groundingConfig) {
            return undefined;
        }

        const tools: any[] = [];

        // Google Search grounding - use google_search field per Vertex AI docs
        // Format: tools: [{ googleSearch: {} }]
        if (groundingConfig.googleSearch !== undefined && groundingConfig.googleSearch !== false) {
            // Correct format for @google-cloud/aiplatform
            const searchTool = {
                google_search: {}
            };

            // Dynamic retrieval config if specified
            if (typeof groundingConfig.googleSearch === 'object' && groundingConfig.googleSearch !== null) {
                if ((groundingConfig.googleSearch as any).dynamicRetrieval) {
                    (searchTool as any).google_search.dynamic_retrieval_config = {
                        mode: 'MODE_DYNAMIC',
                        dynamic_threshold: 0.3
                    };
                }
            }

            tools.push(searchTool);
            this.logger.log('Added Google Search grounding tool (google_search)');
        }

        // Google Maps grounding - skip for now
        if (groundingConfig.googleMaps !== undefined) {
            this.logger.warn('Google Maps grounding not directly supported');
        }

        // URL Context - skip for now  
        if (groundingConfig.urlContext?.urls && groundingConfig.urlContext.urls.length > 0) {
            this.logger.warn('URL Context handled separately');
        }

        return tools.length > 0 ? tools : undefined;
    }

    /**
     * Prepare tool config with retrieval settings
     * Used for location-aware grounding (Maps)
     */
    prepareToolConfig(groundingConfig?: GroundingConfigDto): any | undefined {
        if (!groundingConfig) {
            return undefined;
        }

        const toolConfig: any = {};

        // Add retrieval config for location-based grounding
        if (groundingConfig.googleMaps?.location || groundingConfig.retrievalConfig?.latLng) {
            const location = groundingConfig.googleMaps?.location || groundingConfig.retrievalConfig?.latLng;

            toolConfig.retrievalConfig = {
                latLng: {
                    latitude: location!.latitude,
                    longitude: location!.longitude
                }
            };

            // Add language code if specified
            const langCode = groundingConfig.googleMaps?.languageCode || groundingConfig.retrievalConfig?.languageCode;
            if (langCode) {
                toolConfig.retrievalConfig.languageCode = langCode;
            }

            this.logger.log(`Added retrieval config with location: ${location!.latitude}, ${location!.longitude}`);
        }

        return Object.keys(toolConfig).length > 0 ? toolConfig : undefined;
    }

    /**
     * Prepare URL context for content
     * URLs are included in the prompt/content, not in tools
     */
    prepareUrlContextContent(urlContext?: UrlContextDto): string | undefined {
        if (!urlContext?.urls || urlContext.urls.length === 0) {
            return undefined;
        }

        // URLs can be referenced directly in the prompt
        // The model will use URL Context tool to fetch content
        return urlContext.urls.join('\n');
    }

    /**
     * Extract grounding metadata from response
     * Returns structured metadata including search queries, chunks, and sources
     */
    extractGroundingMetadata(response: any): any | undefined {
        if (!response.candidates || response.candidates.length === 0) {
            return undefined;
        }

        const candidate = response.candidates[0];
        const metadata = candidate.groundingMetadata;

        if (!metadata) {
            return undefined;
        }

        // Structure the grounding metadata for better usability
        const result: any = {
            // Search queries used for grounding
            webSearchQueries: metadata.webSearchQueries || [],

            // Grounding chunks (sources)
            groundingChunks: this.parseGroundingChunks(metadata.groundingChunks),

            // Search entry point (for displaying search suggestions)
            searchEntryPoint: metadata.searchEntryPoint,

            // Grounding supports (confidence scores)
            groundingSupports: metadata.groundingSupports || [],

            // Retrieval metadata
            retrievalMetadata: metadata.retrievalMetadata,
        };

        // Google Maps specific metadata
        if (metadata.groundingChunks) {
            result.mapsData = this.extractMapsData(metadata.groundingChunks);
        }

        // Google Maps widget context token
        if (metadata.googleMapsWidgetContextToken) {
            result.mapsWidgetToken = metadata.googleMapsWidgetContextToken;
        }

        // URL context metadata
        if (candidate.urlContextMetadata) {
            result.urlContextMetadata = candidate.urlContextMetadata;
        }

        return result;
    }

    /**
     * Parse grounding chunks into structured format
     */
    private parseGroundingChunks(chunks: any[]): any[] {
        if (!chunks || !Array.isArray(chunks)) {
            return [];
        }

        return chunks.map((chunk: any) => {
            // Web source
            if (chunk.web) {
                return {
                    type: 'web',
                    uri: chunk.web.uri,
                    title: chunk.web.title,
                };
            }

            // Maps source
            if (chunk.maps) {
                return {
                    type: 'maps',
                    uri: chunk.maps.uri,
                    title: chunk.maps.title,
                    placeId: chunk.maps.placeId,
                    placeAnswerSources: chunk.maps.placeAnswerSources,
                };
            }

            // Generic source
            return {
                type: 'unknown',
                uri: chunk.retrievedContext?.uri || chunk.uri,
                title: chunk.retrievedContext?.title || chunk.title,
            };
        });
    }

    /**
     * Extract Google Maps specific data from grounding chunks
     */
    private extractMapsData(chunks: any[]): any[] {
        if (!chunks || !Array.isArray(chunks)) {
            return [];
        }

        return chunks
            .filter((chunk: any) => chunk.maps)
            .map((chunk: any) => ({
                uri: chunk.maps.uri,
                title: chunk.maps.title,
                placeId: chunk.maps.placeId,
                reviewSnippets: chunk.maps.placeAnswerSources?.reviewSnippets || [],
            }));
    }

    /**
     * Extract search URLs from grounding metadata
     */
    extractSearchUrls(response: any): string[] {
        const metadata = this.extractGroundingMetadata(response);
        if (!metadata?.groundingChunks) {
            return [];
        }

        return metadata.groundingChunks
            .filter((chunk: any) => chunk.type === 'web')
            .map((chunk: any) => chunk.uri)
            .filter((uri: string) => uri);
    }

    /**
     * Extract Maps places from grounding metadata
     */
    extractMapsPlaces(response: any): any[] {
        const metadata = this.extractGroundingMetadata(response);
        return metadata?.mapsData || [];
    }

    /**
     * Check if response has grounding
     */
    hasGrounding(response: any): boolean {
        const metadata = this.extractGroundingMetadata(response);
        return !!metadata && (
            (metadata.groundingChunks && metadata.groundingChunks.length > 0) ||
            (metadata.webSearchQueries && metadata.webSearchQueries.length > 0)
        );
    }

    /**
     * Check if response has Maps grounding
     */
    hasMapsGrounding(response: any): boolean {
        const metadata = this.extractGroundingMetadata(response);
        return !!metadata?.mapsData && metadata.mapsData.length > 0;
    }

    /**
     * Check if response has URL context
     */
    hasUrlContext(response: any): boolean {
        const metadata = this.extractGroundingMetadata(response);
        return !!metadata?.urlContextMetadata;
    }
}
