/**
 * OpenRouter Function Calling Service
 * Tool use and function execution support
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    PREMIUM_MODELS,
    MODEL_CAPABILITIES,
    OpenRouterRequest,
    OpenRouterResponse,
    ChatMessage,
} from '../types/openrouter.types';
import {
    FunctionCallRequestDto,
    SubmitFunctionResultsDto,
    BUILTIN_FUNCTIONS,
} from '../dto/function-call.dto';

@Injectable()
export class OpenRouterFunctionCallingService {
    private readonly logger = new Logger(OpenRouterFunctionCallingService.name);
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly siteUrl: string;
    private readonly siteName: string;

    // Models that support function calling
    private readonly functionCallModels = [
        PREMIUM_MODELS.CLAUDE_OPUS_4_5,
        PREMIUM_MODELS.CLAUDE_SONNET_4_5,
        PREMIUM_MODELS.GPT_5_2,
        PREMIUM_MODELS.GPT_4O,
        PREMIUM_MODELS.GEMINI_2_5_PRO,
        PREMIUM_MODELS.GEMINI_2_5_FLASH,
    ];

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY', '');
        this.baseUrl = this.configService.get<string>('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1');
        this.siteUrl = this.configService.get<string>('OPENROUTER_SITE_URL', 'https://orenax.com');
        this.siteName = this.configService.get<string>('OPENROUTER_SITE_NAME', 'OrenaX AI Platform');
    }

    /**
     * Initial function calling request
     * Returns either a response or tool calls for execution
     */
    async invokeFunctionCalling(request: FunctionCallRequestDto): Promise<OpenRouterResponse> {
        const model = request.model || PREMIUM_MODELS.CLAUDE_SONNET_4_5;

        // Validate model supports function calling
        const capabilities = MODEL_CAPABILITIES[model];
        if (capabilities && !capabilities.supportsFunctionCalling) {
            throw new HttpException(
                `Model ${model} does not support function calling. Use one of: ${this.functionCallModels.join(', ')}`,
                HttpStatus.BAD_REQUEST,
            );
        }

        this.logger.log(`Function calling request - Model: ${model}, Tools: ${request.tools.length}`);

        const payload: OpenRouterRequest = {
            model,
            messages: request.messages as ChatMessage[],
            tools: request.tools,
            tool_choice: request.tool_choice || 'auto',
        };

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': this.siteUrl,
                    'X-Title': this.siteName,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new HttpException(
                    error.error?.message || 'Function calling failed',
                    response.status,
                );
            }

            const data = await response.json() as OpenRouterResponse;

            // Log if tool calls were requested
            const toolCalls = data.choices?.[0]?.message?.tool_calls;
            if (toolCalls && toolCalls.length > 0) {
                this.logger.log(`Tool calls requested: ${toolCalls.map(tc => tc.function.name).join(', ')}`);
            }

            return data;
        } catch (error) {
            if (error instanceof HttpException) throw error;

            this.logger.error(`Function calling error: ${error.message}`);
            throw new HttpException(
                `Function calling failed: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Submit function results and get final response
     */
    async submitFunctionResults(request: SubmitFunctionResultsDto): Promise<OpenRouterResponse> {
        const model = request.model || PREMIUM_MODELS.CLAUDE_SONNET_4_5;

        this.logger.log(`Submitting ${request.function_results.length} function results`);

        // Build messages with function results
        const messages: ChatMessage[] = [...request.messages as ChatMessage[]];

        // Add tool result messages
        for (const result of request.function_results) {
            messages.push({
                role: 'tool',
                tool_call_id: result.tool_call_id,
                content: result.result,
            });
        }

        const payload: OpenRouterRequest = {
            model,
            messages,
            tools: request.tools,
        };

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': this.siteUrl,
                    'X-Title': this.siteName,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new HttpException(
                    error.error?.message || 'Function result submission failed',
                    response.status,
                );
            }

            const data = await response.json() as OpenRouterResponse;

            this.logger.log(`Function results processed - Tokens: ${data.usage?.total_tokens || 'N/A'}`);

            return data;
        } catch (error) {
            if (error instanceof HttpException) throw error;

            this.logger.error(`Function result error: ${error.message}`);
            throw new HttpException(
                `Function result submission failed: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Get built-in function definitions
     */
    getBuiltinFunctions() {
        return BUILTIN_FUNCTIONS;
    }

    /**
     * Get list of function-calling capable models
     */
    getFunctionCallModels(): string[] {
        return this.functionCallModels;
    }

    /**
     * Check if a model supports function calling
     */
    supportsFunctionCalling(modelId: string): boolean {
        const capabilities = MODEL_CAPABILITIES[modelId];
        return capabilities?.supportsFunctionCalling || this.functionCallModels.includes(modelId as any);
    }
}
