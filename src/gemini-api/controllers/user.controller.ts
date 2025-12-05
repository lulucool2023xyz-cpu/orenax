import {
    Controller,
    Get,
    Delete,
    Param,
    Query,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MediaStorageService } from '../../supabase/media-storage.service';
import { GeminiConversationService } from '../services/gemini-conversation.service';

/**
 * User Controller - API v2
 * User-facing endpoints for managing their generated content
 * All endpoints require JWT authentication
 */
@Controller('api/v2/user')
@UseGuards(JwtAuthGuard)
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(
        private readonly mediaStorage: MediaStorageService,
        private readonly conversationService: GeminiConversationService,
    ) { }

    // Helper to parse pagination params
    private parsePagination(limit?: string, offset?: string) {
        return {
            limit: limit ? parseInt(limit, 10) : 50,
            offset: offset ? parseInt(offset, 10) : 0,
        };
    }

    /**
     * GET /api/v2/user/media
     * Get all generated media for the authenticated user
     */
    @Get('media')
    @HttpCode(HttpStatus.OK)
    async getAllMedia(
        @Request() req: any,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        const userId = req.user?.sub || req.user?.id;
        const { limit: limitNum, offset: offsetNum } = this.parsePagination(limit, offset);

        const media = await this.mediaStorage.getUserMedia(userId, undefined, limitNum, offsetNum);

        return {
            data: media,
            pagination: { limit: limitNum, offset: offsetNum, total: media.length },
        };
    }

    /**
     * GET /api/v2/user/media/images
     * Get all generated images for the authenticated user
     */
    @Get('media/images')
    @HttpCode(HttpStatus.OK)
    async getImages(
        @Request() req: any,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        const userId = req.user?.sub || req.user?.id;
        const { limit: limitNum, offset: offsetNum } = this.parsePagination(limit, offset);

        const images = await this.mediaStorage.getUserMedia(userId, 'image', limitNum, offsetNum);

        return {
            data: images,
            pagination: { limit: limitNum, offset: offsetNum, total: images.length },
        };
    }

    /**
     * GET /api/v2/user/media/videos
     * Get all generated videos for the authenticated user
     */
    @Get('media/videos')
    @HttpCode(HttpStatus.OK)
    async getVideos(
        @Request() req: any,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        const userId = req.user?.sub || req.user?.id;
        const { limit: limitNum, offset: offsetNum } = this.parsePagination(limit, offset);

        const videos = await this.mediaStorage.getUserMedia(userId, 'video', limitNum, offsetNum);

        return {
            data: videos,
            pagination: { limit: limitNum, offset: offsetNum, total: videos.length },
        };
    }

    /**
     * GET /api/v2/user/media/audio
     * Get all generated audio (TTS) for the authenticated user
     */
    @Get('media/audio')
    @HttpCode(HttpStatus.OK)
    async getAudio(
        @Request() req: any,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        const userId = req.user?.sub || req.user?.id;
        const { limit: limitNum, offset: offsetNum } = this.parsePagination(limit, offset);

        const audio = await this.mediaStorage.getUserMedia(userId, 'audio', limitNum, offsetNum);

        return {
            data: audio,
            pagination: { limit: limitNum, offset: offsetNum, total: audio.length },
        };
    }

    /**
     * GET /api/v2/user/media/music
     * Get all generated music for the authenticated user
     */
    @Get('media/music')
    @HttpCode(HttpStatus.OK)
    async getMusic(
        @Request() req: any,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        const userId = req.user?.sub || req.user?.id;
        const { limit: limitNum, offset: offsetNum } = this.parsePagination(limit, offset);

        const music = await this.mediaStorage.getUserMedia(userId, 'music', limitNum, offsetNum);

        return {
            data: music,
            pagination: { limit: limitNum, offset: offsetNum, total: music.length },
        };
    }

    /**
     * GET /api/v2/user/media/:id
     * Get a specific media item by ID
     */
    @Get('media/:id')
    @HttpCode(HttpStatus.OK)
    async getMediaById(@Request() req: any, @Param('id') mediaId: string) {
        const userId = req.user?.sub || req.user?.id;

        const media = await this.mediaStorage.getMediaById(mediaId, userId);
        if (!media) {
            return { error: 'Media not found', statusCode: 404 };
        }

        return { data: media };
    }

    /**
     * DELETE /api/v2/user/media/:id
     * Delete a specific media item
     */
    @Delete('media/:id')
    @HttpCode(HttpStatus.OK)
    async deleteMedia(@Request() req: any, @Param('id') mediaId: string) {
        const userId = req.user?.sub || req.user?.id;

        const success = await this.mediaStorage.deleteMedia(mediaId, userId);
        return { success, message: success ? 'Media deleted' : 'Failed to delete media' };
    }

    /**
     * GET /api/v2/user/conversations
     * Get all conversations for the authenticated user
     */
    @Get('conversations')
    @HttpCode(HttpStatus.OK)
    async getConversations(@Request() req: any) {
        const userId = req.user?.sub || req.user?.id;

        const conversations = await this.conversationService.listConversations(userId);
        return { data: conversations };
    }

    /**
     * GET /api/v2/user/conversations/:id
     * Get a specific conversation with messages
     */
    @Get('conversations/:id')
    @HttpCode(HttpStatus.OK)
    async getConversationById(
        @Request() req: any,
        @Param('id') conversationId: string,
    ) {
        const userId = req.user?.sub || req.user?.id;

        const messages = await this.conversationService.getConversationHistory(
            conversationId,
            userId,
        );
        return { data: messages };
    }

    /**
     * GET /api/v2/user/stats
     * Get user's generation statistics
     */
    @Get('stats')
    @HttpCode(HttpStatus.OK)
    async getStats(@Request() req: any) {
        const userId = req.user?.sub || req.user?.id;

        const stats = await this.mediaStorage.getUserMediaStats(userId);
        return { data: stats };
    }
}
