import { Injectable, Logger } from '@nestjs/common';
import { FunctionDeclarationDto, FunctionCallDto, FunctionResponseDto } from '../dto/tool.dto';
import { Tool } from '../types/vertex-ai.types';

/**
 * Function Calling Service
 * Phase 4: Handles function calling with parallel & sequential support
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
     * Extract function calls from response
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
     */
    createFunctionResponse(name: string, response: any): FunctionResponseDto {
        return {
            name,
            response,
        };
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
     */
    extractThoughtSignature(response: any): string | undefined {
        if (!response.candidates || response.candidates.length === 0) {
            return undefined;
        }

        return response.candidates[0].thoughtSignature;
    }
}
