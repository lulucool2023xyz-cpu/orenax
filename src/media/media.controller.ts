import {
    Controller,
    Get,
    Delete,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';
import { MediaHistoryQueryDto } from './dto/media-history.dto';

/**
 * Media Controller
 * Handles media history/gallery endpoints
 */
@Controller('api/v2/media')
@UseGuards(JwtAuthGuard)
export class MediaController {
    private readonly logger = new Logger(MediaController.name);

    constructor(private readonly mediaService: MediaService) { }

    /**
     * GET /api/v2/media/history
     * Get paginated media history for the authenticated user
     */
    @Get('history')
    @HttpCode(HttpStatus.OK)
    async getHistory(@Query() query: MediaHistoryQueryDto, @Req() req: Request) {
        const userId = (req as any).user?.sub || (req as any).user?.id;
        this.logger.log(`Media history request - User: ${userId}, Type: ${query.type || 'all'}, Page: ${query.page}`);
        return this.mediaService.getMediaHistory(userId, query);
    }

    /**
     * DELETE /api/v2/media/:id
     * Delete media by ID (only owner can delete)
     */
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteMedia(@Param('id') id: string, @Req() req: Request) {
        const userId = (req as any).user?.sub || (req as any).user?.id;
        this.logger.log(`Delete media request - User: ${userId}, Media: ${id}`);
        return this.mediaService.deleteMedia(userId, id);
    }
}
