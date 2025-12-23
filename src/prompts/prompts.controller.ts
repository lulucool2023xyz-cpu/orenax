import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Query,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PromptsService } from './prompts.service';
import { CreatePromptDto, UpdatePromptDto, PromptsQueryDto } from './dto/prompts.dto';

/**
 * Prompts Controller
 * Handles prompt marketplace endpoints
 */
@Controller('api/v2/prompts')
export class PromptsController {
    private readonly logger = new Logger(PromptsController.name);

    constructor(private readonly promptsService: PromptsService) { }

    /**
     * GET /api/v2/prompts/marketplace
     * Browse public prompts
     */
    @Get('marketplace')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getMarketplace(@Query() query: PromptsQueryDto, @Req() req: Request) {
        const userId = (req as any).user?.sub || (req as any).user?.id;
        this.logger.log(`Marketplace request - Category: ${query.category || 'all'}, Sort: ${query.sort}`);
        return this.promptsService.getMarketplace(userId, query);
    }

    /**
     * GET /api/v2/prompts/mine
     * Get user's own prompts
     */
    @Get('mine')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getMyPrompts(@Query() query: PromptsQueryDto, @Req() req: Request) {
        const userId = (req as any).user?.sub || (req as any).user?.id;
        this.logger.log(`My prompts request - User: ${userId}`);
        return this.promptsService.getMyPrompts(userId, query);
    }

    /**
     * POST /api/v2/prompts
     * Create a new prompt
     */
    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async createPrompt(@Body() dto: CreatePromptDto, @Req() req: Request) {
        const userId = (req as any).user?.sub || (req as any).user?.id;
        this.logger.log(`Create prompt request - User: ${userId}, Title: ${dto.title}`);
        return this.promptsService.createPrompt(userId, dto);
    }

    /**
     * PUT /api/v2/prompts/:id
     * Update an existing prompt
     */
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async updatePrompt(@Param('id') id: string, @Body() dto: UpdatePromptDto, @Req() req: Request) {
        const userId = (req as any).user?.sub || (req as any).user?.id;
        this.logger.log(`Update prompt request - User: ${userId}, Prompt: ${id}`);
        return this.promptsService.updatePrompt(userId, id, dto);
    }

    /**
     * DELETE /api/v2/prompts/:id
     * Delete a prompt
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async deletePrompt(@Param('id') id: string, @Req() req: Request) {
        const userId = (req as any).user?.sub || (req as any).user?.id;
        this.logger.log(`Delete prompt request - User: ${userId}, Prompt: ${id}`);
        return this.promptsService.deletePrompt(userId, id);
    }

    /**
     * POST /api/v2/prompts/:id/save
     * Save/bookmark a prompt
     */
    @Post(':id/save')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async savePrompt(@Param('id') id: string, @Req() req: Request) {
        const userId = (req as any).user?.sub || (req as any).user?.id;
        this.logger.log(`Save prompt request - User: ${userId}, Prompt: ${id}`);
        return this.promptsService.savePrompt(userId, id);
    }

    /**
     * POST /api/v2/prompts/:id/use
     * Record usage and get prompt content
     */
    @Post(':id/use')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async usePrompt(@Param('id') id: string) {
        this.logger.log(`Use prompt request - Prompt: ${id}`);
        return this.promptsService.usePrompt(id);
    }
}
