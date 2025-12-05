import {
    Controller,
    Post,
    Get,
    Body,
    Res,
    Query,
    HttpCode,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { GenerationService } from '../services/generation.service';
import { ImageService } from '../services/image.service';
import { VideoService } from '../services/video.service';
import { MusicService } from '../services/music.service';
import { GenAIClientService } from '../services/genai-client.service';
import { GroundingService } from '../services/grounding.service';
import { ThinkingService } from '../services/thinking.service';
import { FunctionCallingService } from '../services/function-calling.service';
import { GeminiModelId, GEMINI_MODELS, IMAGEN_MODELS, VEO_MODELS, LYRIA_MODELS } from '../types/constants';
import { ThinkingLevel } from '../dto/thinking-config.dto';

/**
 * V1 API Controller
 * Unified controller for all Vertex AI capabilities
 * 
 * Endpoints:
 * - POST /v1/chat - Chat with grounding and thinking
 * - POST /v1/chat/stream - Streaming chat
 * - POST /v1/image/generate - Text to image
 * - POST /v1/image/upscale - Image upscaling
 * - POST /v1/video/generate - Text to video
 * - POST /v1/video/status - Video operation status
 * - POST /v1/music/generate - Text to music
 * - GET /v1/models - List available models
 */
@Controller('v1')
export class V1ApiController {
    private readonly logger = new Logger(V1ApiController.name);

    constructor(
        private readonly generationService: GenerationService,
        private readonly imageService: ImageService,
        private readonly videoService: VideoService,
        private readonly musicService: MusicService,
        private readonly genaiClient: GenAIClientService,
        private readonly groundingService: GroundingService,
        private readonly thinkingService: ThinkingService,
        private readonly functionCallingService: FunctionCallingService,
    ) { }

    // =====================
    // CHAT ENDPOINTS
    // =====================

    /**
     * Chat endpoint with full feature support
     */
    @Post('chat')
    @HttpCode(HttpStatus.OK)
    async chat(@Body() body: {
        messages: Array<{ role: string; content: string }>;
        model?: string;
        stream?: boolean;
        grounding?: {
            googleSearch?: boolean;
            googleMaps?: { latitude: number; longitude: number };
            vertexAiSearch?: { datastoreId: string };
        };
        thinking?: {
            thinkingLevel?: 'LOW' | 'HIGH';
            thinkingBudget?: number;
        };
        tools?: any[];
        temperature?: number;
        maxOutputTokens?: number;
    }) {
        const modelId = (body.model || 'gemini-2.5-flash') as GeminiModelId;

        try {
            // Prepare thinking config with proper enum
            const thinkingConfig = body.thinking ? {
                thinkingLevel: body.thinking.thinkingLevel === 'HIGH' ? ThinkingLevel.HIGH :
                    body.thinking.thinkingLevel === 'LOW' ? ThinkingLevel.LOW : undefined,
                thinkingBudget: body.thinking.thinkingBudget,
            } : undefined;

            // Prepare grounding config
            let groundingConfig: any;
            if (body.grounding) {
                groundingConfig = {
                    googleSearch: body.grounding.googleSearch ? { enabled: true } : undefined,
                    googleMaps: body.grounding.googleMaps,
                    vertexAiSearch: body.grounding.vertexAiSearch,
                };
            }

            // Generate response
            const response = await this.generationService.generateContent(
                body.messages,
                modelId,
                {
                    temperature: body.temperature || 1.0,
                    maxOutputTokens: body.maxOutputTokens || 8192,
                },
                true, // useSystemInstruction
                thinkingConfig,
                undefined, // multimodalContents
                groundingConfig,
            );

            // Extract response data
            const text = this.generationService.extractTextFromResponse(response);
            const thoughts = this.generationService.extractThoughts(response);
            const groundingMetadata = this.groundingService.extractGroundingMetadata(response);

            return {
                success: true,
                model: modelId,
                response: {
                    text,
                    thoughts: thoughts.length > 0 ? thoughts : undefined,
                    grounding: groundingMetadata,
                },
                usage: response.usageMetadata,
            };
        } catch (error) {
            this.logger.error('Chat error:', error);
            throw error;
        }
    }

    /**
     * Streaming chat endpoint
     */
    @Post('chat/stream')
    async chatStream(
        @Body() body: {
            messages: Array<{ role: string; content: string }>;
            model?: string;
            grounding?: any;
            thinking?: any;
        },
        @Res() res: Response,
    ) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        try {
            // Use GenAI client for streaming
            const stream = this.genaiClient.streamContent({
                model: body.model || 'gemini-2.5-flash',
                contents: body.messages.map(m => ({
                    role: m.role === 'assistant' ? 'model' : m.role,
                    parts: [{ text: m.content }],
                })),
            });

            for await (const chunk of stream) {
                const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (text) {
                    res.write(`data: ${JSON.stringify({ text })}\n\n`);
                }
            }

            res.write('data: [DONE]\n\n');
            res.end();
        } catch (error) {
            this.logger.error('Stream error:', error);
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
    }

    // =====================
    // IMAGE ENDPOINTS
    // =====================

    /**
     * Generate image from text
     */
    @Post('image/generate')
    @HttpCode(HttpStatus.OK)
    async generateImage(@Body() body: {
        prompt: string;
        model?: string;
        aspectRatio?: string;
        sampleCount?: number;
        negativePrompt?: string;
        personGeneration?: string;
        enhancePrompt?: boolean;
    }) {
        return this.imageService.textToImage({
            prompt: body.prompt,
            model: body.model || 'imagen-4.0-generate-001',
            sampleCount: body.sampleCount || 1,
            negativePrompt: body.negativePrompt,
            personGeneration: body.personGeneration || 'allow_adult',
        });
    }

    /**
     * Upscale image
     */
    @Post('image/upscale')
    @HttpCode(HttpStatus.OK)
    async upscaleImage(@Body() body: {
        image: string;
        upscaleFactor?: 'x2' | 'x3' | 'x4';
    }) {
        return this.imageService.upscaleImage({
            image: body.image,
            upscaleFactor: body.upscaleFactor || 'x2',
        });
    }

    /**
     * Edit image with mask
     */
    @Post('image/edit')
    @HttpCode(HttpStatus.OK)
    async editImage(@Body() body: {
        prompt: string;
        image: { bytesBase64Encoded?: string; gcsUri?: string };
        mask?: { bytesBase64Encoded?: string; gcsUri?: string };
        editMode?: string;
    }) {
        // Build reference images array for editImage DTO
        const referenceImages = [{
            referenceType: 'REFERENCE_TYPE_RAW',
            referenceId: 1,
            bytesBase64Encoded: body.image.bytesBase64Encoded || '',
        }];
        if (body.mask?.bytesBase64Encoded) {
            referenceImages.push({
                referenceType: 'REFERENCE_TYPE_MASK',
                referenceId: 2,
                bytesBase64Encoded: body.mask.bytesBase64Encoded,
            });
        }
        return this.imageService.editImage({
            prompt: body.prompt,
            referenceImages,
            editMode: body.editMode || 'EDIT_MODE_INPAINT_INSERTION',
        });
    }

    // =====================
    // VIDEO ENDPOINTS
    // =====================

    /**
     * Generate video from text
     */
    @Post('video/generate')
    @HttpCode(HttpStatus.OK)
    async generateVideo(@Body() body: {
        prompt: string;
        model?: string;
        durationSeconds?: number;
        aspectRatio?: string;
        resolution?: string;
        generateAudio?: boolean;
    }) {
        return this.videoService.textToVideo({
            prompt: body.prompt,
            model: body.model || 'veo-3.0-generate-001',
            durationSeconds: body.durationSeconds || 8,
            aspectRatio: (body.aspectRatio as any) || '16:9',
            resolution: (body.resolution as any) || '720p',
            generateAudio: body.generateAudio ?? true,
        });
    }

    /**
     * Generate video from image
     */
    @Post('video/image-to-video')
    @HttpCode(HttpStatus.OK)
    async imageToVideo(@Body() body: {
        prompt: string;
        image: { bytesBase64Encoded?: string; gcsUri?: string; mimeType?: string };
        model?: string;
        durationSeconds?: number;
    }) {
        return this.videoService.imageToVideo({
            prompt: body.prompt,
            image: body.image,
            model: body.model || 'veo-3.0-generate-001',
            durationSeconds: body.durationSeconds || 8,
        });
    }

    /**
     * Get video operation status
     */
    @Get('video/status')
    async videoStatus(@Query('operationId') operationId: string) {
        return this.videoService.getOperationStatus(operationId);
    }

    // =====================
    // MUSIC ENDPOINTS
    // =====================

    /**
     * Generate music from text
     */
    @Post('music/generate')
    @HttpCode(HttpStatus.OK)
    async generateMusic(@Body() body: {
        prompt: string;
        negativePrompt?: string;
        seed?: number;
        sampleCount?: number;
    }) {
        return this.musicService.generateMusic({
            prompt: body.prompt,
            negativePrompt: body.negativePrompt,
            seed: body.seed,
            sampleCount: body.sampleCount || 1,
        });
    }

    // =====================
    // UTILITY ENDPOINTS
    // =====================

    /**
     * List available models
     */
    @Get('models')
    listModels() {
        return {
            chat: Object.keys(GEMINI_MODELS),
            image: Object.keys(IMAGEN_MODELS),
            video: Object.keys(VEO_MODELS),
            music: Object.keys(LYRIA_MODELS),
        };
    }

    /**
     * Health check
     */
    @Get('health')
    healthCheck() {
        return {
            status: 'ok',
            genaiClient: this.genaiClient.isReady(),
            timestamp: new Date().toISOString(),
        };
    }

    // =====================
    // TTS ENDPOINTS
    // =====================

    /**
     * Single speaker text-to-speech
     */
    @Post('tts/synthesize')
    @HttpCode(HttpStatus.OK)
    async ttsSynthesize(@Body() body: {
        text: string;
        voiceName?: string;
        speakingRate?: number;
        pitch?: number;
        languageCode?: string;
    }) {
        // TTS service would be injected and used here
        return {
            success: true,
            message: 'TTS endpoint available. Use /api/gemini/tts/single for full implementation.',
            params: body,
        };
    }

    /**
     * Get available TTS voices
     */
    @Get('tts/voices')
    ttsVoices() {
        return {
            voices: [
                { name: 'Aoede', type: 'standard' },
                { name: 'Charon', type: 'standard' },
                { name: 'Fenrir', type: 'standard' },
                { name: 'Kore', type: 'standard' },
                { name: 'Puck', type: 'standard' },
                { name: 'Zephyr', type: 'expressive' },
                { name: 'Harmony', type: 'expressive' },
                { name: 'Aurora', type: 'expressive' },
                { name: 'Ember', type: 'expressive' },
            ],
        };
    }

    // =====================
    // PROMPT MANAGEMENT
    // =====================

    /**
     * List all prompts
     */
    @Get('prompts')
    listPrompts() {
        return {
            prompts: [
                { name: 'orenax-agent', displayName: 'OrenaX Agent', description: 'Default Indonesian AI assistant' },
                { name: 'code-assistant', displayName: 'Code Assistant', description: 'Programming assistant' },
            ],
        };
    }

    /**
     * Get prompt by name
     */
    @Get('prompts/:name')
    getPrompt(@Query('name') name: string) {
        return {
            name,
            message: 'Use PromptManagementService for full prompt management.',
        };
    }

    // =====================
    // DOCUMENT ENDPOINTS
    // =====================

    /**
     * Analyze document
     */
    @Post('document/analyze')
    @HttpCode(HttpStatus.OK)
    async analyzeDocument(@Body() body: {
        document: { bytesBase64Encoded?: string; gcsUri?: string; mimeType: string };
        prompt: string;
        model?: string;
    }) {
        // DocumentService would be injected and used here
        return {
            success: true,
            message: 'Document analysis endpoint. Use DocumentService for implementation.',
            supportedTypes: ['application/pdf', 'text/plain', 'text/html', 'text/csv'],
        };
    }

    /**
     * Summarize document
     */
    @Post('document/summarize')
    @HttpCode(HttpStatus.OK)
    async summarizeDocument(@Body() body: {
        document: { bytesBase64Encoded?: string; gcsUri?: string; mimeType: string };
    }) {
        return {
            success: true,
            message: 'Document summarization endpoint.',
        };
    }

    // =====================
    // SAFETY CONFIGURATION
    // =====================

    /**
     * Get safety presets
     */
    @Get('safety/presets')
    getSafetyPresets() {
        return {
            presets: {
                PERMISSIVE: 'Blocks only high probability harm',
                DEFAULT: 'Blocks medium and above',
                STRICT: 'Blocks low and above',
            },
            categories: [
                'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                'HARM_CATEGORY_HATE_SPEECH',
                'HARM_CATEGORY_HARASSMENT',
                'HARM_CATEGORY_DANGEROUS_CONTENT',
            ],
        };
    }
}
