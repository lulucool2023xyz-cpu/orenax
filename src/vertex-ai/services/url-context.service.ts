import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * URL Context Service
 * 
 * Provides URL content for grounding with Gemini models.
 * Fetches and processes web page content for context.
 */
@Injectable()
export class UrlContextService {
    private readonly logger = new Logger(UrlContextService.name);

    constructor(private readonly configService: ConfigService) { }

    /**
     * Prepare URL context tool for grounding
     */
    prepareUrlContextTool(urls: string[]): any {
        if (!urls || urls.length === 0) {
            return undefined;
        }

        this.logger.log(`Preparing URL context for ${urls.length} URL(s)`);

        return {
            urlContext: {
                urls: urls.map(url => ({ url })),
            }
        };
    }

    /**
     * Extract URL context metadata from response
     */
    extractUrlContextMetadata(response: any): any | undefined {
        const candidate = response?.candidates?.[0];
        if (!candidate?.groundingMetadata?.urlContextMetadata) {
            return undefined;
        }

        const metadata = candidate.groundingMetadata.urlContextMetadata;
        return {
            urlContexts: metadata.urlContexts || [],
            renderedContent: metadata.renderedContent,
        };
    }

    /**
     * Build content request with URL context
     */
    buildRequestWithUrlContext(options: {
        model: string;
        prompt: string;
        urls: string[];
        systemInstruction?: string;
    }): any {
        const tools: any[] = [];
        const urlContextTool = this.prepareUrlContextTool(options.urls);
        if (urlContextTool) {
            tools.push(urlContextTool);
        }

        return {
            model: options.model,
            contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
            systemInstruction: options.systemInstruction ? {
                parts: [{ text: options.systemInstruction }],
            } : undefined,
            tools,
            generationConfig: {
                temperature: 1.0,
            },
        };
    }

    /**
     * Validate URL format
     */
    isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Filter valid URLs
     */
    filterValidUrls(urls: string[]): string[] {
        return urls.filter(url => this.isValidUrl(url));
    }
}
