import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShareService } from './share.service';
import { CreateShareDto } from './dto/share.dto';

/**
 * Share Controller
 * Handles chat sharing endpoints
 */
@Controller('api/v2')
export class ShareController {
    private readonly logger = new Logger(ShareController.name);

    constructor(private readonly shareService: ShareService) { }

    /**
     * POST /api/v2/chat/share
     * Create a shareable link for a conversation
     */
    @Post('chat/share')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createShare(@Body() dto: CreateShareDto, @Req() req: AuthenticatedRequest) {
        const userId = req.user?.sub || req.user?.id;
        this.logger.log(`Create share request - User: ${userId}, Conversation: ${dto.conversationId}`);
        return this.shareService.createShare(userId, dto);
    }

    /**
     * GET /api/v2/shared/:shareId
     * Get shared chat (PUBLIC - no authentication required)
     */
    @Get('shared/:shareId')
    @HttpCode(HttpStatus.OK)
    async getSharedChat(@Param('shareId') shareId: string) {
        this.logger.log(`Get shared chat request - Share ID: ${shareId}`);
        return this.shareService.getSharedChat(shareId);
    }

    /**
     * DELETE /api/v2/chat/share/:shareId
     * Revoke a shared link
     */
    @Delete('chat/share/:shareId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async deleteShare(@Param('shareId') shareId: string, @Req() req: AuthenticatedRequest) {
        const userId = req.user?.sub || req.user?.id;
        this.logger.log(`Delete share request - User: ${userId}, Share: ${shareId}`);
        return this.shareService.deleteShare(userId, shareId);
    }
}
