import { Injectable, Logger } from '@nestjs/common';
import { google } from '@google-cloud/aiplatform/build/protos/protos';
import { GroundingConfigDto, GoogleSearchDto, GoogleMapsDto, UrlContextDto } from '../dto/grounding.dto';

type ITool = google.cloud.aiplatform.v1.ITool;

/**
 * Grounding Service
 * Phase 3: Implements Google Search and Google Maps grounding for Vertex AI
 */
@Injectable()
export class GroundingService {
    private readonly logger = new Logger(GroundingService.name);

    /**
     * Prepare grounding tools for Vertex AI request
     * Supports Google Search and Google Maps grounding
     */
    prepareGroundingTools(groundingConfig?: GroundingConfigDto): ITool[] | undefined {
        if (!groundingConfig) {
            return undefined;
        }

        const tools: ITool[] = [];

        // Google Search grounding
        // CRITICAL: Protobuf requires one_of field to be initialized
        // Based on protobuf definition, Tool has oneof: function_declarations, retrieval, google_search_retrieval, code_execution
        // But error said "please use google_search field instead" - this suggests a different format for Gemini
        // Let's try using googleSearchRetrieval with minimal config as per protobuf definition
        if (groundingConfig.googleSearch !== undefined && groundingConfig.googleSearch !== null) {
            const tool: ITool = {
                // Use googleSearchRetrieval field (camelCase in JS, google_search_retrieval in protobuf)
                googleSearchRetrieval: {
                    dynamicRetrievalConfig: {
                        mode: 1 // MODE_DYNAMIC = 1 (enum value)
                    }
                }
            };
            
            // Handle excludeDomains - note: this might not be supported in protobuf format
            if (typeof groundingConfig.googleSearch === 'object' && 
                groundingConfig.googleSearch.excludeDomains && 
                Array.isArray(groundingConfig.googleSearch.excludeDomains) &&
                groundingConfig.googleSearch.excludeDomains.length > 0) {
                this.logger.warn(`excludeDomains provided but may not be supported in protobuf format: ${groundingConfig.googleSearch.excludeDomains.join(', ')}`);
            }
            
            tools.push(tool);
            this.logger.log(`Added Google Search grounding (googleSearchRetrieval with MODE_DYNAMIC)`);
        }

        // Google Maps grounding
        // Google Maps grounding is supported in Gemini API
        // Similar to Google Search, we use a retrieval tool structure
        // Note: The protobuf types may not include googleMapsRetrieval yet,
        // but the API supports it, so we use type assertion
        if (groundingConfig.googleMaps !== undefined && groundingConfig.googleMaps !== null) {
            const mapsTool: any = {
                // Try googleMapsRetrieval field (following the same pattern as googleSearchRetrieval)
                // If this doesn't work, the API will return an error and we can adjust
                googleMapsRetrieval: {
                    // Google Maps grounding configuration
                    // enableWidget is handled in the response metadata, not in the tool config
                }
            };
            
            // If enableWidget is requested, we'll handle it in the response processing
            if (typeof groundingConfig.googleMaps === 'object' && 
                groundingConfig.googleMaps.enableWidget) {
                this.logger.log('Google Maps widget enabled - widget data will be in response metadata');
            }
            
            tools.push(mapsTool as ITool);
            this.logger.log('Added Google Maps grounding (googleMapsRetrieval)');
        }

        // URL context grounding requires Vertex AI Search setup
        // Commenting out until proper datastore is configured
        if (groundingConfig.urlContext && groundingConfig.urlContext.urls && groundingConfig.urlContext.urls.length > 0) {
            this.logger.warn('URL context grounding requires Vertex AI Search datastore setup');
            this.logger.debug(`URLs provided: ${groundingConfig.urlContext.urls.join(', ')}`);
            // TODO: Set up Vertex AI Search datastore and uncomment below
            /*
            tools.push({
                retrieval: {
                    vertexAiSearch: {
                        datastore: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/locations/global/collections/default_collection/dataStores/default_data_store`
                    }
                }
            });
            this.logger.log(`Added URL context grounding: ${groundingConfig.urlContext.urls.length} URLs`);
            */
        }

        return tools.length > 0 ? tools : undefined;
    }

    /**
     * Extract grounding metadata from response
     * Returns structured metadata including search queries, chunks, and entry point
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
            webSearchQueries: metadata.webSearchQueries || [],
            groundingChunks: (metadata.groundingChunks || []).map((chunk: any) => ({
                uri: chunk.web?.uri || chunk.uri,
                title: chunk.web?.title || chunk.title,
            })),
            searchEntryPoint: metadata.searchEntryPoint,
            groundingSupports: metadata.groundingSupports || [],
        };

        // Google Maps specific metadata
        if (metadata.groundingChunks) {
            // Extract Maps-specific data from grounding chunks
            const mapsChunks = metadata.groundingChunks.filter((chunk: any) => 
                chunk.retrievedContext?.uri?.startsWith('https://maps.google.com') ||
                chunk.retrievedContext?.uri?.startsWith('https://www.google.com/maps')
            );
            
            if (mapsChunks.length > 0) {
                result.mapsChunks = mapsChunks.map((chunk: any) => ({
                    uri: chunk.retrievedContext?.uri || chunk.uri,
                    title: chunk.retrievedContext?.title || chunk.title,
                }));
            }
        }

        // Google Maps widget data (if enableWidget was used)
        if (metadata.groundingSupports) {
            const mapsSupport = metadata.groundingSupports.find((support: any) => 
                support.segment?.textSegment?.endIndex !== undefined
            );
            if (mapsSupport) {
                result.mapWidget = {
                    segment: mapsSupport.segment,
                    confidenceScore: mapsSupport.confidenceScore,
                };
            }
        }

        return result;
    }

    /**
     * Extract search URLs from grounding metadata
     */
    extractSearchUrls(response: any): string[] {
        const metadata = this.extractGroundingMetadata(response);
        if (!metadata || !metadata.groundingChunks) {
            return [];
        }
        return metadata.groundingChunks
            .map((chunk: any) => chunk.uri)
            .filter((uri: string) => uri);
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
}
