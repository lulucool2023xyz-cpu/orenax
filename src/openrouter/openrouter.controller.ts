/**
 * OpenRouter API Controller
 * Premium AI models via OpenRouter unified API
 */

import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Query,
    Res,
    Req,
    HttpCode,
    HttpStatus,
    UseGuards,
    Logger,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

// Services
import { OpenRouterChatService } from './services/openrouter-chat.service';
import { OpenRouterStreamingService } from './services/openrouter-streaming.service';
import { OpenRouterModelsService } from './services/openrouter-models.service';
import { OpenRouterVisionService } from './services/openrouter-vision.service';
import { OpenRouterAudioService } from './services/openrouter-audio.service';
import { OpenRouterFunctionCallingService } from './services/openrouter-function-calling.service';

// DTOs
import {
    ChatCompletionRequestDto,
    ChatCompletionResponseDto,
} from './dto/chat-completion.dto';
import { ListModelsQueryDto, ModelsListResponseDto, ModelInfoDto } from './dto/model-list.dto';
import { VisionRequestDto, VisionResponseDto, AudioRequestDto, AudioResponseDto } from './dto/multimodal-request.dto';
import { FunctionCallRequestDto, SubmitFunctionResultsDto } from './dto/function-call.dto';

// Types
import { OpenRouterRequest, PREMIUM_MODELS } from './types/openrouter.types';

@ApiTags('OpenRouter Multi-Model AI')
@ApiBearerAuth()
@Controller('api/v2/openrouter')
@UseGuards(JwtAuthGuard)
export class OpenRouterController {
    private readonly logger = new Logger(OpenRouterController.name);

    constructor(
        private readonly chatService: OpenRouterChatService,
        private readonly streamingService: OpenRouterStreamingService,
        private readonly modelsService: OpenRouterModelsService,
        private readonly visionService: OpenRouterVisionService,
        private readonly audioService: OpenRouterAudioService,
        private readonly functionCallingService: OpenRouterFunctionCallingService,
    ) { }

    // ========================================
    // Chat Completion Endpoints
    // ========================================

    @Post('chat/completions')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 req/min for AI
    @ApiOperation({
        summary: 'Create chat completion',
        description: 'Generate text using premium AI models via OpenRouter. Supports 500+ models including Claude Opus 4.5, GPT-5.2, Gemini 2.5 Pro.',
    })
    @ApiBody({
        type: ChatCompletionRequestDto,
        examples: {
            simple: {
                summary: 'Simple chat',
                value: {
                    model: 'anthropic/claude-sonnet-4.5',
                    messages: [{ role: 'user', content: 'What is the capital of France?' }],
                },
            },
            withSystem: {
                summary: 'With system prompt',
                value: {
                    model: 'openai/gpt-4o',
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant.' },
                        { role: 'user', content: 'Explain quantum computing simply.' },
                    ],
                    temperature: 0.7,
                    max_tokens: 1000,
                },
            },
        },
    })
    @ApiResponse({ status: 200, type: ChatCompletionResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
    async createChatCompletion(
        @Body() request: ChatCompletionRequestDto,
        @Req() req: Request,
    ): Promise<ChatCompletionResponseDto> {
        const userId = (req as any).user?.sub || 'anonymous';
        this.logger.log(`Chat completion - User: ${userId}, Model: ${request.model || 'default'}`);

        const openRouterRequest: OpenRouterRequest = {
            model: request.model || PREMIUM_MODELS.CLAUDE_SONNET_4_5,
            messages: request.messages.map(m => ({
                role: m.role,
                content: m.content as any,
                name: m.name,
                tool_call_id: m.tool_call_id,
            })),
            temperature: request.temperature,
            top_p: request.top_p,
            max_tokens: request.max_tokens,
            stream: false,
            tools: request.tools,
            stop: request.stop,
            frequency_penalty: request.frequency_penalty,
            presence_penalty: request.presence_penalty,
            seed: request.seed,
        };

        return this.chatService.createChatCompletion(openRouterRequest) as Promise<ChatCompletionResponseDto>;
    }

    @Post('chat/stream')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 req/min for streaming
    @ApiOperation({
        summary: 'Stream chat completion',
        description: 'Real-time streaming chat completion using Server-Sent Events (SSE).',
    })
    @ApiResponse({ status: 200, description: 'SSE stream of chat chunks' })
    async streamChatCompletion(
        @Body() request: ChatCompletionRequestDto,
        @Res() res: Response,
        @Req() req: Request,
    ): Promise<void> {
        const userId = (req as any).user?.sub || 'anonymous';
        this.logger.log(`Streaming chat - User: ${userId}, Model: ${request.model || 'default'}`);

        const openRouterRequest: OpenRouterRequest = {
            model: request.model || PREMIUM_MODELS.CLAUDE_SONNET_4_5,
            messages: request.messages.map(m => ({
                role: m.role,
                content: m.content as any,
                name: m.name,
                tool_call_id: m.tool_call_id,
            })),
            temperature: request.temperature,
            top_p: request.top_p,
            max_tokens: request.max_tokens,
            stream: true,
        };

        await this.streamingService.streamChatCompletion(openRouterRequest, res);
    }

    // ========================================
    // Model Endpoints
    // ========================================

    @Get('models')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'List available models',
        description: 'Get list of premium AI models with capabilities and pricing information.',
    })
    @ApiQuery({ name: 'capability', required: false, enum: ['vision', 'audio', 'function_calling', 'streaming'] })
    @ApiQuery({ name: 'provider', required: false, description: 'Filter by provider (e.g., Anthropic, OpenAI)' })
    @ApiQuery({ name: 'premium_only', required: false, type: Boolean, description: 'Only show premium models' })
    @ApiResponse({ status: 200, type: ModelsListResponseDto })
    listModels(@Query() query: ListModelsQueryDto): ModelsListResponseDto {
        return this.modelsService.getPremiumModels({
            capability: query.capability,
            provider: query.provider,
        });
    }

    @Get('models/:modelId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get model details' })
    @ApiParam({ name: 'modelId', example: 'anthropic/claude-sonnet-4.5' })
    @ApiResponse({ status: 200, type: ModelInfoDto })
    @ApiResponse({ status: 404, description: 'Model not found' })
    async getModel(@Param('modelId') modelId: string): Promise<ModelInfoDto> {
        // Handle URL-encoded model IDs
        const decodedId = decodeURIComponent(modelId);
        const model = await this.modelsService.getModel(decodedId);

        if (!model) {
            throw new Error(`Model ${decodedId} not found`);
        }

        return model;
    }

    @Get('models/recommended/:useCase')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get recommended models for use case' })
    @ApiParam({ name: 'useCase', enum: ['chat', 'vision', 'audio', 'coding', 'reasoning'] })
    @ApiResponse({ status: 200, type: [String] })
    getRecommendedModels(
        @Param('useCase') useCase: 'chat' | 'vision' | 'audio' | 'coding' | 'reasoning',
    ): string[] {
        return this.modelsService.getRecommendedModels(useCase);
    }

    // ========================================
    // Vision Endpoints
    // ========================================

    @Post('vision')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 15, ttl: 60000 } }) // 15 req/min for vision
    @ApiOperation({
        summary: 'Analyze images',
        description: 'Analyze images using vision-capable models like GPT-4o, Claude Opus 4.5, Gemini 2.5 Pro.',
    })
    @ApiBody({
        type: VisionRequestDto,
        examples: {
            single: {
                summary: 'Analyze single image',
                value: {
                    model: 'openai/gpt-4o',
                    images: [{ url: 'https://example.com/image.jpg', detail: 'high' }],
                    prompt: 'Describe this image in detail.',
                },
            },
        },
    })
    @ApiResponse({ status: 200, type: VisionResponseDto })
    async analyzeImages(
        @Body() request: VisionRequestDto,
        @Req() req: Request,
    ): Promise<VisionResponseDto> {
        const userId = (req as any).user?.sub || 'anonymous';
        this.logger.log(`Vision analysis - User: ${userId}, Images: ${request.images.length}`);

        return this.visionService.analyzeImages(request);
    }

    // ========================================
    // Audio Endpoints
    // ========================================

    @Post('audio')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 req/min for audio
    @ApiOperation({
        summary: 'Process audio',
        description: 'Transcribe, analyze, summarize, or translate audio using GPT-4o Audio.',
    })
    @ApiBody({
        type: AudioRequestDto,
        examples: {
            transcribe: {
                summary: 'Transcribe audio',
                value: {
                    model: 'openai/gpt-4o-audio-preview',
                    audio: { url: 'data:audio/mp3;base64,...' },
                    prompt: 'Transcribe this audio accurately.',
                    task: 'transcribe',
                },
            },
        },
    })
    @ApiResponse({ status: 200, type: AudioResponseDto })
    async processAudio(
        @Body() request: AudioRequestDto,
        @Req() req: Request,
    ): Promise<AudioResponseDto> {
        const userId = (req as any).user?.sub || 'anonymous';
        this.logger.log(`Audio processing - User: ${userId}, Task: ${request.task || 'transcribe'}`);

        return this.audioService.processAudio(request);
    }

    // ========================================
    // Function Calling Endpoints
    // ========================================

    @Post('tools/invoke')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    @ApiOperation({
        summary: 'Invoke function calling',
        description: 'Send a request with tool definitions. Model may respond with tool calls to execute.',
    })
    @ApiResponse({ status: 200, type: ChatCompletionResponseDto })
    async invokeFunctionCalling(
        @Body() request: FunctionCallRequestDto,
        @Req() req: Request,
    ): Promise<ChatCompletionResponseDto> {
        const userId = (req as any).user?.sub || 'anonymous';
        this.logger.log(`Function calling - User: ${userId}, Tools: ${request.tools.length}`);

        return this.functionCallingService.invokeFunctionCalling(request) as Promise<ChatCompletionResponseDto>;
    }

    @Post('tools/submit')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    @ApiOperation({
        summary: 'Submit function results',
        description: 'Submit the results of executed functions to get the final response.',
    })
    @ApiResponse({ status: 200, type: ChatCompletionResponseDto })
    async submitFunctionResults(
        @Body() request: SubmitFunctionResultsDto,
        @Req() req: Request,
    ): Promise<ChatCompletionResponseDto> {
        const userId = (req as any).user?.sub || 'anonymous';
        this.logger.log(`Function results - User: ${userId}, Results: ${request.function_results.length}`);

        return this.functionCallingService.submitFunctionResults(request) as Promise<ChatCompletionResponseDto>;
    }

    @Get('tools/builtin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get built-in function definitions' })
    getBuiltinFunctions() {
        return this.functionCallingService.getBuiltinFunctions();
    }

    // ========================================
    // Health Check
    // ========================================

    @Get('health')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'OpenRouter API health check' })
    healthCheck() {
        return {
            status: 'ok',
            service: 'openrouter',
            timestamp: new Date().toISOString(),
            premiumModels: Object.keys(PREMIUM_MODELS).length,
        };
    }
}
