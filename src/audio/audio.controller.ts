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
import { TtsService } from '../vertex-ai/services/tts.service';
import {
    SingleSpeakerTtsRequestDto,
    MultiSpeakerTtsRequestDto,
    TTS_VOICES,
} from '../vertex-ai/dto/tts-request.dto';

/**
 * Audio Controller - API v1
 * Text-to-Speech endpoints using Google Cloud TTS
 * All endpoints require JWT authentication
 */
@Controller('api/v1/audio')
@UseGuards(JwtAuthGuard)
export class AudioController {
    private readonly logger = new Logger(AudioController.name);

    constructor(private readonly ttsService: TtsService) { }

    /**
     * POST /api/v1/audio/tts/single
     * Single speaker text-to-speech
     */
    @Post('tts/single')
    @HttpCode(HttpStatus.OK)
    async synthesizeSingle(@Body() dto: SingleSpeakerTtsRequestDto) {
        this.logger.log(`Single-speaker TTS request - Voice: ${dto.voiceName || 'Kore'}`);
        return this.ttsService.synthesizeSingleSpeaker(dto);
    }

    /**
     * POST /api/v1/audio/tts/multi
     * Multi-speaker text-to-speech
     */
    @Post('tts/multi')
    @HttpCode(HttpStatus.OK)
    async synthesizeMulti(@Body() dto: MultiSpeakerTtsRequestDto) {
        this.logger.log(`Multi-speaker TTS request - ${dto.speakerConfigs.length} speakers`);
        return this.ttsService.synthesizeMultiSpeaker(dto);
    }

    /**
     * GET /api/v1/audio/tts/voices
     * Get available TTS voices
     */
    @Get('tts/voices')
    @HttpCode(HttpStatus.OK)
    async getVoices() {
        return this.ttsService.getAvailableVoices();
    }

    /**
     * GET /api/v1/audio/tts/status
     * Check TTS service availability
     */
    @Get('tts/status')
    @HttpCode(HttpStatus.OK)
    getStatus() {
        return {
            available: this.ttsService.isConfigured(),
            features: {
                singleSpeaker: true,
                multiSpeaker: true,
                speakingRate: { min: 0.25, max: 4.0 },
                pitch: { min: -20.0, max: 20.0 },
                volumeGainDb: { min: -96.0, max: 16.0 },
            },
            defaultVoice: 'Kore',
            availableVoices: TTS_VOICES,
            output: {
                format: 'MP3',
                sampleRate: 'Variable',
            },
            languages: ['en-US'],
        };
    }
}
