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
} from '@nestjs/common';
import type { Response } from 'express';
import { GeminiGenerationService } from './services/gemini-generation.service';
import { GeminiStreamingService } from './services/gemini-streaming.service';
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

/**
 * Gemini API v2 Controller
 * Provides chat endpoints using Google Gemini API
 */
@Controller('api/v2')
export class GeminiApiController {
    private readonly logger = new Logger(GeminiApiController.name);

    constructor(
        private readonly generationService: GeminiGenerationService,
        private readonly streamingService: GeminiStreamingService,
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
    ): Promise<void> {
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
    ): Promise<void> {
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
