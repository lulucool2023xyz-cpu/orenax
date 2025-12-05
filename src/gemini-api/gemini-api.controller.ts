import {
    Controller,
    Post,
    Get,
    Body,
    Res,
    HttpCode,
    HttpStatus,
    Logger,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GeminiGenerationService } from './services/gemini-generation.service';
import { GeminiStreamingService } from './services/gemini-streaming.service';
import { GeminiImageService } from './services/gemini-image.service';
import { GeminiVideoService } from './services/gemini-video.service';
import { GeminiMusicService } from './services/gemini-music.service';
import { GeminiApiConfigService } from './config/gemini-api.config';
import {
    GeminiChatRequestDto,
    GeminiCountTokensRequestDto,
} from './dto/gemini-chat-request.dto';
import {
    GeminiChatResponseDto,
    GeminiModelsResponseDto,
    GeminiCountTokensResponseDto,
} from './dto/gemini-chat-response.dto';
import { GeminiImageGenerationDto } from './dto/gemini-image.dto';
import {
    GeminiVideoGenerationDto,
    ImageToVideoDto,
    VideoExtendDto,
    FrameInterpolationDto,
    VideoWithReferencesDto,
} from './dto/gemini-video.dto';
import { GeminiMusicGenerationDto } from './dto/gemini-music.dto';
import { SingleSpeakerTtsDto, MultiSpeakerTtsDto } from './dto/tts.dto';
import { TtsService } from './services/tts.service';

/**
 * Gemini API v2 Controller
 * Provides chat, image, video, and music endpoints using Google Gemini API
 * All endpoints require JWT authentication
 */
@Controller('api/v2')
@UseGuards(JwtAuthGuard)
export class GeminiApiController {
    private readonly logger = new Logger(GeminiApiController.name);

    constructor(
        private readonly generationService: GeminiGenerationService,
        private readonly streamingService: GeminiStreamingService,
        private readonly imageService: GeminiImageService,
        private readonly videoService: GeminiVideoService,
        private readonly musicService: GeminiMusicService,
        private readonly ttsService: TtsService,
        private readonly configService: GeminiApiConfigService,
    ) { }

    /**
     * POST /api/v2/chat
     * Main chat endpoint - supports both streaming and non-streaming
     */
    @Post('chat')
    @HttpCode(HttpStatus.OK)
    async chat(
        @Body() request: GeminiChatRequestDto,
        @Res() res: Response,
        @Req() req: Request,
    ): Promise<void> {
        // Extract userId from JWT
        const userId = (req as any).user?.sub || (req as any).user?.id;
        if (userId) {
            request.userId = userId;
        }

        this.logger.log(`Chat request - Model: ${request.model || 'default'}, Stream: ${request.stream}`);

        // Handle streaming
        if (request.stream) {
            await this.streamingService.streamResponse(res, request);
            return;
        }

        // Non-streaming response
        const response = await this.generationService.generateContent(request);
        res.json(response);
    }

    /**
     * POST /api/v2/chat/stream
     * Dedicated streaming endpoint
     */
    @Post('chat/stream')
    @HttpCode(HttpStatus.OK)
    async chatStream(
        @Body() request: GeminiChatRequestDto,
        @Res() res: Response,
        @Req() req: Request,
    ): Promise<void> {
        // Extract userId from JWT
        const userId = (req as any).user?.sub || (req as any).user?.id;
        if (userId) {
            request.userId = userId;
        }

        this.logger.log(`Stream request - Model: ${request.model || 'default'}`);

        // Force streaming
        request.stream = true;
        await this.streamingService.streamResponse(res, request);
    }

    /**
     * POST /api/v2/chat/generate
     * Simple generate endpoint (non-streaming only)
     */
    @Post('chat/generate')
    @HttpCode(HttpStatus.OK)
    async generate(
        @Body() request: GeminiChatRequestDto,
    ): Promise<GeminiChatResponseDto> {
        this.logger.log(`Generate request - Model: ${request.model || 'default'}`);

        // Force non-streaming
        request.stream = false;
        return this.generationService.generateContent(request);
    }

    /**
     * POST /api/v2/image/generate
     * Generate images from text prompt using Gemini/Imagen
     */
    @Post('image/generate')
    @HttpCode(HttpStatus.OK)
    async generateImage(@Body() request: GeminiImageGenerationDto, @Req() req: Request) {
        this.logger.log(`Image generation request - Prompt length: ${request.prompt?.length}`);
        const userId = (req as any).user?.sub || (req as any).user?.id;
        return this.imageService.generateImage({ ...request, userId });
    }

    /**
     * GET /api/v2/image/status
     * Check if image generation is available
     */
    @Get('image/status')
    @HttpCode(HttpStatus.OK)
    imageStatus() {
        return {
            available: this.imageService.isConfigured(),
            defaultModel: 'imagen-4.0-generate-001',
            supportedModels: [
                'imagen-4.0-generate-001',
                'imagen-4.0-ultra-generate-001',
                'imagen-4.0-fast-generate-001',
                'imagen-3.0-generate-002',
                'gemini-3-pro-image-preview',
                'gemini-2.5-flash-image',
            ],
        };
    }

    // ============================================
    // VIDEO GENERATION ENDPOINTS (Veo)
    // ============================================

    /**
     * POST /api/v2/video/generate
     * Generate video from text prompt using Veo models
     */
    @Post('video/generate')
    @HttpCode(HttpStatus.OK)
    async generateVideo(@Body() request: GeminiVideoGenerationDto, @Req() req: Request) {
        this.logger.log(`Video generation request - Model: ${request.model || 'veo-3.1-generate-preview'}`);
        const userId = (req as any).user?.sub || (req as any).user?.id;
        return this.videoService.generateVideo({ ...request, userId });
    }

    /**
     * GET /api/v2/video/status
     * Check if video generation is available
     */
    @Get('video/status')
    @HttpCode(HttpStatus.OK)
    videoStatus() {
        return {
            available: this.videoService.isConfigured(),
            defaultModel: 'veo-3.1-generate-preview',
            supportedModels: this.videoService.getSupportedModels(),
            features: {
                maxDuration: '8s',
                resolutions: ['720p', '1080p', '4k'],
                aspectRatios: ['16:9', '9:16', '1:1'],
                audioSupport: true,
                advancedFeatures: [
                    'image-to-video',
                    'video-extension',
                    'frame-interpolation',
                    'reference-images',
                ],
            },
        };
    }

    /**
     * POST /api/v2/video/image-to-video
     * Generate video from an image
     */
    @Post('video/image-to-video')
    @HttpCode(HttpStatus.OK)
    async imageToVideo(@Body() request: ImageToVideoDto) {
        this.logger.log(`Image-to-Video request - Model: ${request.model || 'default'}`);
        return this.videoService.imageToVideo(request);
    }

    /**
     * POST /api/v2/video/extend
     * Extend an existing video
     */
    @Post('video/extend')
    @HttpCode(HttpStatus.OK)
    async extendVideo(@Body() request: VideoExtendDto) {
        this.logger.log(`Video extend request - Extension: ${request.extensionSeconds}s`);
        return this.videoService.extendVideo(request);
    }

    /**
     * POST /api/v2/video/interpolate
     * Generate video between first and last frame
     */
    @Post('video/interpolate')
    @HttpCode(HttpStatus.OK)
    async interpolateFrames(@Body() request: FrameInterpolationDto) {
        this.logger.log(`Frame interpolation request - Duration: ${request.durationSeconds}s`);
        return this.videoService.interpolateFrames(request);
    }

    /**
     * POST /api/v2/video/with-references
     * Generate video with style/asset reference images
     */
    @Post('video/with-references')
    @HttpCode(HttpStatus.OK)
    async videoWithReferences(@Body() request: VideoWithReferencesDto) {
        this.logger.log(`Video with references - Refs: ${request.referenceImages.length}`);
        return this.videoService.generateWithReferences(request);
    }

    /**
     * GET /api/v2/video/operation/:id
     * Check operation status
     */
    @Get('video/operation')
    @HttpCode(HttpStatus.OK)
    async videoOperationStatus(@Query('id') operationId: string) {
        this.logger.log(`Video operation status check: ${operationId}`);
        return this.videoService.getOperationStatus(operationId);
    }

    // ============================================
    // MUSIC GENERATION ENDPOINTS (Lyria)
    // ============================================

    /**
     * POST /api/v2/music/generate
     * Generate music from weighted prompts using Lyria RealTime
     */
    @Post('music/generate')
    @HttpCode(HttpStatus.OK)
    async generateMusic(@Body() request: GeminiMusicGenerationDto, @Req() req: Request) {
        this.logger.log(`Music generation request - Prompts: ${request.prompts?.length}`);
        const userId = (req as any).user?.sub || (req as any).user?.id;
        return this.musicService.generateMusic({ ...request, userId });
    }

    /**
     * GET /api/v2/music/status
     * Check if music generation is available
     */
    @Get('music/status')
    @HttpCode(HttpStatus.OK)
    musicStatus() {
        return {
            available: this.musicService.isConfigured(),
            model: 'lyria-realtime-exp',
            features: {
                maxDuration: '120s',
                bpmRange: '60-200',
                outputFormat: 'WAV (48kHz stereo)',
                scales: [
                    'C_MAJOR_A_MINOR',
                    'D_MAJOR_B_MINOR',
                    'E_MAJOR_D_FLAT_MINOR',
                    'F_MAJOR_D_MINOR',
                    'G_MAJOR_E_MINOR',
                    'A_MAJOR_G_FLAT_MINOR',
                    'B_MAJOR_A_FLAT_MINOR',
                ],
            },
        };
    }

    // ============================================
    // TEXT-TO-SPEECH ENDPOINTS (TTS)
    // ============================================

    /**
     * POST /api/v2/tts/single
     * Generate single-speaker audio from text
     */
    @Post('tts/single')
    @HttpCode(HttpStatus.OK)
    async ttsSingle(@Body() request: SingleSpeakerTtsDto, @Req() req: Request) {
        this.logger.log(`TTS single request - Voice: ${request.voiceName}`);
        const userId = (req as any).user?.sub || (req as any).user?.id;
        return this.ttsService.generateSingleSpeaker({ ...request, userId });
    }

    /**
     * POST /api/v2/tts/multi
     * Generate multi-speaker audio from text
     */
    @Post('tts/multi')
    @HttpCode(HttpStatus.OK)
    async ttsMulti(@Body() request: MultiSpeakerTtsDto, @Req() req: Request) {
        this.logger.log(`TTS multi request - Speakers: ${request.speakers?.length}`);
        const userId = (req as any).user?.sub || (req as any).user?.id;
        return this.ttsService.generateMultiSpeaker({ ...request, userId });
    }

    /**
     * GET /api/v2/tts/voices
     * List available voices for TTS
     */
    @Get('tts/voices')
    @HttpCode(HttpStatus.OK)
    ttsVoices() {
        return this.ttsService.getVoices();
    }

    /**
     * GET /api/v2/tts/status
     * Check if TTS is available
     */
    @Get('tts/status')
    @HttpCode(HttpStatus.OK)
    ttsStatus() {
        return this.ttsService.getStatus();
    }

    /**
     * POST /api/v2/count-tokens
     * Count tokens in a request
     */
    @Post('count-tokens')
    @HttpCode(HttpStatus.OK)
    async countTokens(
        @Body() request: GeminiCountTokensRequestDto,
    ): Promise<GeminiCountTokensResponseDto> {
        this.logger.log(`Count tokens request - Model: ${request.model || 'default'}`);

        // Prepare contents similar to chat
        let contents: any;
        if (request.contents) {
            contents = request.contents;
        } else if (request.messages) {
            contents = request.messages.map(m => ({
                role: m.role,
                parts: [{ text: m.content }],
            }));
        } else if (request.prompt) {
            contents = request.prompt;
        }

        return this.generationService.countTokens(request.model as any, contents);
    }

    /**
     * GET /api/v2/models
     * List available models
     */
    @Get('models')
    @HttpCode(HttpStatus.OK)
    listModels(): GeminiModelsResponseDto {
        this.logger.log('List models request');

        const models = this.configService.getSupportedModels();
        const defaultModel = this.configService.getDefaultModel();

        return {
            models: models.map(model => ({
                name: model.name,
                displayName: model.displayName,
                description: model.description,
                supportsThinking: model.supportsThinking,
                thinkingType: model.thinkingType,
                maxInputTokens: model.maxInputTokens,
                maxOutputTokens: model.maxOutputTokens,
                supportedFeatures: [...model.supportedFeatures],
            })),
            defaultModel,
        };
    }

    /**
     * GET /api/v2/health
     * Health check endpoint
     */
    @Get('health')
    @HttpCode(HttpStatus.OK)
    healthCheck(): { status: string; configured: boolean; timestamp: string } {
        return {
            status: 'ok',
            configured: this.configService.isConfigured(),
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * POST /api/v2/simple
     * Simplified endpoint - just send a prompt, get a response
     */
    @Post('simple')
    @HttpCode(HttpStatus.OK)
    async simple(
        @Body() body: { prompt: string; model?: string },
    ): Promise<{ text: string; model: string }> {
        this.logger.log(`Simple request - Prompt length: ${body.prompt?.length}`);

        const response = await this.generationService.generateContent({
            prompt: body.prompt,
            model: body.model as any,
        });

        return {
            text: response.text,
            model: response.model,
        };
    }
}

