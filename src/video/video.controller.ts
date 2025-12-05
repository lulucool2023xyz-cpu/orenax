import {
    Controller,
    Post,
    Get,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VideoService } from '../vertex-ai/services/video.service';
import {
    TextToVideoDto,
    ImageToVideoDto,
    VideoExtendDto,
    FrameInterpolationDto,
    VideoWithReferencesDto,
} from '../vertex-ai/dto/video-request.dto';

/**
 * Video Controller - API v1
 * Handles all video generation endpoints using Vertex AI
 * All endpoints require JWT authentication
 */
@Controller('api/v1/video')
@UseGuards(JwtAuthGuard)
export class VideoController {
    private readonly logger = new Logger(VideoController.name);

    constructor(private readonly videoService: VideoService) { }

    /**
     * POST /api/v1/video/text-to-video
     * Generate video from text prompt
     */
    @Post('text-to-video')
    @HttpCode(HttpStatus.OK)
    async textToVideo(@Body() dto: TextToVideoDto) {
        this.logger.log(`Text-to-Video request - Model: ${dto.model || 'default'}`);
        return this.videoService.textToVideo(dto);
    }

    /**
     * POST /api/v1/video/image-to-video
     * Generate video from an image
     */
    @Post('image-to-video')
    @HttpCode(HttpStatus.OK)
    async imageToVideo(@Body() dto: ImageToVideoDto) {
        this.logger.log(`Image-to-Video request - Model: ${dto.model || 'default'}`);
        return this.videoService.imageToVideo(dto);
    }

    /**
     * POST /api/v1/video/extend
     * Extend an existing video
     */
    @Post('extend')
    @HttpCode(HttpStatus.OK)
    async extendVideo(@Body() dto: VideoExtendDto) {
        this.logger.log(`Video extend request - Extension: ${dto.extensionSeconds}s`);
        return this.videoService.extendVideo(dto);
    }

    /**
     * POST /api/v1/video/interpolate
     * Generate video between first and last frame
     */
    @Post('interpolate')
    @HttpCode(HttpStatus.OK)
    async interpolateFrames(@Body() dto: FrameInterpolationDto) {
        this.logger.log(`Frame interpolation request - Duration: ${dto.durationSeconds}s`);
        return this.videoService.interpolateFrames(dto);
    }

    /**
     * POST /api/v1/video/with-references
     * Generate video with style/asset reference images
     */
    @Post('with-references')
    @HttpCode(HttpStatus.OK)
    async videoWithReferences(@Body() dto: VideoWithReferencesDto) {
        this.logger.log(`Video with references - Refs: ${dto.referenceImages.length}`);
        return this.videoService.generateWithReferences(dto);
    }

    /**
     * GET /api/v1/video/operation
     * Check video generation operation status
     */
    @Get('operation')
    @HttpCode(HttpStatus.OK)
    async getOperationStatus(@Query('id') operationId: string) {
        this.logger.log(`Operation status check: ${operationId}`);
        return this.videoService.getOperationStatus(operationId);
    }

    /**
     * GET /api/v1/video/status
     * Check if video generation is available
     */
    @Get('status')
    @HttpCode(HttpStatus.OK)
    getStatus() {
        return {
            available: this.videoService.isConfigured(),
            defaultModel: 'veo-3.1-generate-preview',
            supportedModels: this.videoService.getSupportedModels(),
            features: {
                textToVideo: true,
                imageToVideo: true,
                videoExtension: true,
                frameInterpolation: true,
                referenceImages: true,
                maxDuration: '8s',
                resolutions: ['720p', '1080p', '4k'],
                aspectRatios: ['16:9', '9:16', '1:1'],
                audioSupport: true,
            },
        };
    }

    /**
     * GET /api/v1/video/models
     * List supported video models
     */
    @Get('models')
    @HttpCode(HttpStatus.OK)
    getModels() {
        return {
            models: this.videoService.getSupportedModels(),
            default: 'veo-3.1-generate-preview',
        };
    }
}
