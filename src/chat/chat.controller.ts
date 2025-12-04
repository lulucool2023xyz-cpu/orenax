import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    Res,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { ChatRequestDto, CountTokensRequestDto } from '../vertex-ai/dto/chat-request.dto';

/**
 * Chat Controller
 * Handles all chat-related API endpoints
 * All endpoints require JWT authentication
 */
@Controller('api/v1/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    /**
     * POST /api/v1/chat
     * Main chat endpoint - supports both streaming and non-streaming
     */
    @Post()
    @HttpCode(HttpStatus.OK)
    async chat(
        @Body() chatRequest: ChatRequestDto,
        @Request() req,
        @Res() res: Response,
        @Query('conversation_id') conversationId?: string,
    ) {
        const userId = req.user.sub || req.user.id;

        // Streaming response
        if (chatRequest.stream) {
            return this.chatService.streamChat(res, chatRequest, userId, conversationId);
        }

        // Non-streaming response
        const response = await this.chatService.chat(chatRequest, userId, conversationId);
        return res.json(response);
    }

    /**
     * POST /api/v1/chat/count-tokens
     * Count tokens in a message
     */
    @Post('count-tokens')
    async countTokens(
        @Body() countRequest: CountTokensRequestDto,
    ) {
        return this.chatService.countTokens(countRequest);
    }

    /**
     * GET /api/v1/chat/conversations
     * List all conversations for the logged-in user
     */
    @Get('conversations')
    async listConversations(@Request() req) {
        const userId = req.user.sub || req.user.id;
        return this.chatService.listConversations(userId);
    }

    /**
     * GET /api/v1/chat/conversations/:id
     * Get conversation history
     */
    @Get('conversations/:id')
    async getConversationHistory(
        @Param('id') conversationId: string,
        @Request() req,
    ) {
        const userId = req.user.sub || req.user.id;
        return this.chatService.getConversationHistory(conversationId, userId);
    }

    /**
     * DELETE /api/v1/chat/conversations/:id
     * Delete a conversation
     */
    @Delete('conversations/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteConversation(
        @Param('id') conversationId: string,
        @Request() req,
    ) {
        const userId = req.user.sub || req.user.id;
        await this.chatService.deleteConversation(conversationId, userId);
    }
}
