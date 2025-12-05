import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ContextPromptService } from '../services/context-prompt.service';
import { GeminiConversationService } from '../services/gemini-conversation.service';

/**
 * Context Controller - API v2
 * Internal endpoints for context prompt feature
 * Used by AI to build enhanced prompts with user history
 */
@Controller('api/v2/context')
@UseGuards(JwtAuthGuard)
export class ContextController {
    private readonly logger = new Logger(ContextController.name);

    constructor(
        private readonly contextService: ContextPromptService,
        private readonly conversationService: GeminiConversationService,
    ) { }

    /**
     * GET /api/v2/context/active
     * Get active context prompts for the user
     * These are injected into future conversations
     */
    @Get('active')
    @HttpCode(HttpStatus.OK)
    async getActiveContexts(@Request() req: any) {
        const userId = req.user?.sub || req.user?.id;
        const contexts = await this.contextService.getActiveContexts(userId);
        return { data: contexts };
    }

    /**
     * GET /api/v2/context/all
     * Get all context prompts (including inactive)
     */
    @Get('all')
    @HttpCode(HttpStatus.OK)
    async getAllContexts(@Request() req: any) {
        const userId = req.user?.sub || req.user?.id;
        const contexts = await this.contextService.getAllContexts(userId);
        return { data: contexts };
    }

    /**
     * GET /api/v2/context/history
     * Get internal history for AI context building
     * Includes conversation summaries + media history
     */
    @Get('history')
    @HttpCode(HttpStatus.OK)
    async getInternalHistory(@Request() req: any) {
        const userId = req.user?.sub || req.user?.id;
        const history = await this.contextService.getInternalContextHistory(userId);
        return { data: history };
    }

    /**
     * GET /api/v2/context/system-prompt
     * Get enhanced system prompt with user context
     */
    @Get('system-prompt')
    @HttpCode(HttpStatus.OK)
    async getEnhancedSystemPrompt(
        @Request() req: any,
    ) {
        const userId = req.user?.sub || req.user?.id;
        const systemPrompt = await this.contextService.buildContextualSystemPrompt(userId);
        return { data: { systemPrompt } };
    }

    /**
     * POST /api/v2/context/summarize/:conversationId
     * Manually trigger summary generation for a conversation
     */
    @Post('summarize/:conversationId')
    @HttpCode(HttpStatus.OK)
    async summarizeConversation(
        @Request() req: any,
        @Param('conversationId') conversationId: string,
    ) {
        const userId = req.user?.sub || req.user?.id;

        // Get conversation messages
        const messages = await this.conversationService.getConversationHistory(
            conversationId,
            userId,
        );

        if (!messages || messages.length < 2) {
            return { error: 'Not enough messages to summarize' };
        }

        // Format messages for summarization
        const formattedMessages = messages.map((m: any) => ({
            role: m.role as 'user' | 'model',
            content: m.content,
        }));

        const result = await this.contextService.generateSummary(
            userId,
            conversationId,
            formattedMessages,
        );

        if (!result) {
            return { error: 'Failed to generate summary' };
        }

        return { data: result };
    }

    /**
     * DELETE /api/v2/context/:id
     * Deactivate a context prompt (soft delete)
     */
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deactivateContext(
        @Request() req: any,
        @Param('id') contextId: string,
    ) {
        const userId = req.user?.sub || req.user?.id;
        const success = await this.contextService.deactivateContext(contextId, userId);
        return { success };
    }
}
