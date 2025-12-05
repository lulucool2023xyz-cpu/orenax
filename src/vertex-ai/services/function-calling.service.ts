import { Injectable, Logger } from '@nestjs/common';
import { FunctionDeclarationDto, FunctionCallDto, FunctionResponseDto } from '../dto/tool.dto';
import { Tool } from '../types/vertex-ai.types';

/**
 * Function Calling Config Mode
 */
export type FunctionCallingMode = 'AUTO' | 'ANY' | 'NONE';

/**
 * Function Calling Config
 */
export interface FunctionCallingConfig {
    mode?: FunctionCallingMode;
    allowedFunctionNames?: string[];
}

/**
 * Function Calling Service
 * Phase 4: Handles function calling with parallel & sequential support
 * 
 * Features:
 * - Function declaration preparation
 * - FunctionCallingConfig (mode, allowedFunctionNames)
 * - Parallel function calling extraction
 * - Thought signature extraction (for thinking mode)
 */
@Injectable()
export class FunctionCallingService {
    private readonly logger = new Logger(FunctionCallingService.name);

    /**
     * Prepare tools from function declarations
     */
    prepareTools(functionDeclarations: FunctionDeclarationDto[]): Tool[] {
        if (!functionDeclarations || functionDeclarations.length === 0) {
            return [];
        }

        this.logger.log(`Preparing ${functionDeclarations.length} function declaration(s)`);

        return [{
            functionDeclarations: functionDeclarations.map(fd => ({
                name: fd.name,
                description: fd.description,
                parameters: fd.parameters || {},
            })),
        }];
    }

    /**
     * Prepare tool config with function calling config
     * 
     * @param config - FunctionCallingConfig options
     * @returns Tool config for API request
     */
    prepareToolConfig(config?: FunctionCallingConfig): any | undefined {
        if (!config) {
            return undefined;
        }

        const toolConfig: any = {
            functionCallingConfig: {},
        };

        // Set mode (AUTO, ANY, NONE)
        if (config.mode) {
            toolConfig.functionCallingConfig.mode = config.mode;
            this.logger.log(`Function calling mode: ${config.mode}`);
        }

        // Set allowed function names (for mode: ANY)
        if (config.allowedFunctionNames && config.allowedFunctionNames.length > 0) {
            toolConfig.functionCallingConfig.allowedFunctionNames = config.allowedFunctionNames;
            this.logger.log(`Allowed functions: ${config.allowedFunctionNames.join(', ')}`);
        }

        return toolConfig;
    }

    /**
     * Extract function calls from response
     * Supports parallel function calling (multiple calls in one response)
     */
    extractFunctionCalls(response: any): FunctionCallDto[] {
        const calls: FunctionCallDto[] = [];

        if (!response.candidates || response.candidates.length === 0) {
            return calls;
        }

        const candidate = response.candidates[0];
        const parts = candidate.content?.parts || [];

        for (const part of parts) {
            if (part.functionCall) {
                calls.push({
                    name: part.functionCall.name,
                    args: part.functionCall.args || {},
                });
            }
        }

        if (calls.length > 0) {
            this.logger.log(`Extracted ${calls.length} function call(s): ${calls.map(c => c.name).join(', ')}`);
        }

        return calls;
    }

    /**
     * Create function response for next turn
     * @param name - Function name
     * @param response - Function execution result
     * @param thoughtSignature - Optional thought signature for thinking mode
     */
    createFunctionResponse(
        name: string,
        response: any,
        thoughtSignature?: string
    ): any {
        const functionResponse: any = {
            role: 'function',
            parts: [{
                functionResponse: {
                    name,
                    response: {
                        result: response,
                    },
                },
            }],
        };

        // Include thought signature if provided (for thinking mode)
        if (thoughtSignature) {
            functionResponse.thoughtSignature = thoughtSignature;
        }

        return functionResponse;
    }

    /**
     * Create multiple function responses for parallel calls
     */
    createParallelFunctionResponses(
        responses: Array<{ name: string; response: any }>,
        thoughtSignature?: string
    ): any {
        const parts = responses.map(r => ({
            functionResponse: {
                name: r.name,
                response: {
                    result: r.response,
                },
            },
        }));

        const functionResponse: any = {
            role: 'function',
            parts,
        };

        if (thoughtSignature) {
            functionResponse.thoughtSignature = thoughtSignature;
        }

        return functionResponse;
    }

    /**
     * Check if response has function calls
     */
    hasFunctionCalls(response: any): boolean {
        return this.extractFunctionCalls(response).length > 0;
    }

    /**
     * Get finish reason for function calling
     */
    getFinishReason(response: any): string | undefined {
        if (!response.candidates || response.candidates.length === 0) {
            return undefined;
        }

        return response.candidates[0].finishReason;
    }

    /**
     * Check if model stopped for function call
     */
    stoppedForFunctionCall(response: any): boolean {
        const reason = this.getFinishReason(response);
        return reason === 'FUNCTION_CALL' || this.hasFunctionCalls(response);
    }

    /**
     * Extract thought signature (for thinking mode + function calling)
     * Used for multi-turn function calling with thinking enabled
     */
    extractThoughtSignature(response: any): string | undefined {
        if (!response.candidates || response.candidates.length === 0) {
            return undefined;
        }

        return response.candidates[0].thoughtSignature;
    }

    /**
     * Check if streaming function call arguments are available
     */
    hasStreamingArgs(response: any): boolean {
        if (!response.candidates || response.candidates.length === 0) {
            return false;
        }

        const parts = response.candidates[0].content?.parts || [];
        return parts.some((p: any) => p.functionCall?.args !== undefined);
    }
}

