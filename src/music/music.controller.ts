import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MusicService } from '../vertex-ai/services/music.service';
import { LyriaMusicGenerationDto } from '../vertex-ai/dto/music-request.dto';

/**
 * Music Controller - API v1
 * Lyria music generation endpoints
 * All endpoints require JWT authentication
 */
@Controller('api/v1/music')
@UseGuards(JwtAuthGuard)
export class MusicController {
    private readonly logger = new Logger(MusicController.name);

    constructor(private readonly musicService: MusicService) { }

    /**
     * POST /api/v1/music/generate
     * Generate instrumental music from text prompt
     * 
     * Model: lyria-002
     * Output: 32.8 seconds WAV at 48kHz
     */
    @Post('generate')
    @HttpCode(HttpStatus.OK)
    async generateMusic(@Body() dto: LyriaMusicGenerationDto) {
        this.logger.log(`Music generation request - Prompt: "${dto.prompt.substring(0, 50)}..."`);
        return this.musicService.generateMusic(dto);
    }

    /**
     * GET /api/v1/music/status
     * Check music generation service availability
     */
    @Get('status')
    @HttpCode(HttpStatus.OK)
    getStatus() {
        return {
            available: this.musicService.isConfigured(),
            model: 'lyria-002',
            features: {
                textToMusic: true,
                negativePrompt: true,
                seedForReproducibility: true,
                sampleCount: true,
            },
            output: {
                format: 'WAV',
                sampleRate: '48kHz',
                duration: '32.8 seconds',
                type: 'Instrumental only',
            },
            limits: {
                maxSampleCount: 4,
                promptLanguage: 'US English (en-us)',
            },
        };
    }
}
