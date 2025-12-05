import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenAIClientService } from './genai-client.service';

/**
 * Supported document types
 */
export const DOCUMENT_MIME_TYPES = {
    pdf: 'application/pdf',
    txt: 'text/plain',
    html: 'text/html',
    csv: 'text/csv',
    md: 'text/markdown',
} as const;

/**
 * Document understanding request
 */
export interface DocumentRequest {
    document: {
        bytesBase64Encoded?: string;
        gcsUri?: string;
        mimeType: string;
    };
    prompt: string;
    model?: string;
}

/**
 * Document understanding response
 */
export interface DocumentResponse {
    success: boolean;
    text: string;
    model: string;
    documentType: string;
    pageCount?: number;
    usage?: any;
    generatedAt: string;
}

/**
 * Document Service
 * 
 * Phase 9: Document understanding using Gemini models
 * Supports PDF, TXT, HTML, CSV understanding
 */
@Injectable()
export class DocumentService {
    private readonly logger = new Logger(DocumentService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly genaiClient: GenAIClientService,
    ) { }

    /**
     * Analyze document and extract information
     */
    async analyzeDocument(request: DocumentRequest): Promise<DocumentResponse> {
        const model = request.model || 'gemini-2.5-flash';
        this.logger.log(`Analyzing document with model: ${model}`);

        try {
            const contents = this.buildDocumentContents(request);

            const response = await this.genaiClient.generateContent({
                model,
                contents,
            });

            const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

            return {
                success: true,
                text,
                model,
                documentType: request.document.mimeType,
                usage: response.usageMetadata,
                generatedAt: new Date().toISOString(),
            };
        } catch (error) {
            this.logger.error('Document analysis failed:', error);
            throw new HttpException(
                `Document analysis failed: ${(error as Error).message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Summarize document
     */
    async summarizeDocument(document: DocumentRequest['document']): Promise<DocumentResponse> {
        return this.analyzeDocument({
            document,
            prompt: 'Please provide a comprehensive summary of this document. Include key points, main topics, and important details.',
        });
    }

    /**
     * Extract text from document (OCR for images in PDF)
     */
    async extractText(document: DocumentRequest['document']): Promise<DocumentResponse> {
        return this.analyzeDocument({
            document,
            prompt: 'Extract and return all text content from this document exactly as written.',
        });
    }

    /**
     * Answer questions about document
     */
    async askQuestion(
        document: DocumentRequest['document'],
        question: string,
    ): Promise<DocumentResponse> {
        return this.analyzeDocument({
            document,
            prompt: `Based on this document, please answer the following question:\n\n${question}`,
        });
    }

    /**
     * Build contents array for document
     */
    private buildDocumentContents(request: DocumentRequest): any[] {
        const parts: any[] = [];

        // Add document part
        if (request.document.gcsUri) {
            parts.push({
                fileData: {
                    fileUri: request.document.gcsUri,
                    mimeType: request.document.mimeType,
                },
            });
        } else if (request.document.bytesBase64Encoded) {
            parts.push({
                inlineData: {
                    data: request.document.bytesBase64Encoded,
                    mimeType: request.document.mimeType,
                },
            });
        }

        // Add prompt
        parts.push({ text: request.prompt });

        return [{ role: 'user', parts }];
    }

    /**
     * Check if mime type is supported
     */
    isSupportedMimeType(mimeType: string): boolean {
        return Object.values(DOCUMENT_MIME_TYPES).includes(mimeType as any);
    }
}
