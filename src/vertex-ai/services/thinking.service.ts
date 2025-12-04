import { Injectable, Logger } from '@nestjs/common';
import { VertexAiConfigService } from '../config/vertex-ai.config';
import { ThinkingConfigDto, ThinkingLevel } from '../dto/thinking-config.dto';
import { GeminiModelId, DEFAULT_THINKING_BUDGETS } from '../types/constants';

/**
 * Thinking Service
 * Handles thinking mode configuration for Gemini models
 */
@Injectable()
export class ThinkingService {
    private readonly logger = new Logger(ThinkingService.name);

    constructor(private readonly config: VertexAiConfigService) { }

    /**
     * Prepare thinking config for generation request
     * Automatically detects model type and uses appropriate config
     */
    prepareThinkingConfig(
        modelId: GeminiModelId,
        thinkingConfig?: ThinkingConfigDto,
    ): any {
        if (!thinkingConfig) {
            return undefined;
        }

        const isGemini3 = this.config.supportsThinkingLevel(modelId);
        const isGemini25 = this.config.supportsThinkingBudget(modelId);

        // Gemini 3 uses thinkingLevel
        if (isGemini3 && thinkingConfig.thinkingLevel) {
            this.logger.log(`Using Gemini 3 thinking mode: ${thinkingConfig.thinkingLevel}`);

            return {
                thinkingConfig: {
                    thinkingLevel: thinkingConfig.thinkingLevel,
                },
            };
        }

        // Gemini 2.5 uses thinkingBudget
        if (isGemini25 && thinkingConfig.thinkingBudget !== undefined) {
            this.logger.log(`Using Gemini 2.5 thinking budget: ${thinkingConfig.thinkingBudget} tokens`);

            return {
                thinkingConfig: {
                    thinkingBudget: thinkingConfig.thinkingBudget,
                },
            };
        }

        // Auto-select based on model
        if (isGemini3) {
            const level = ThinkingLevel.LOW; // Default to LOW
            this.logger.log(`Auto-selecting Gemini 3 thinking level: ${level}`);

            return {
                thinkingConfig: {
                    thinkingLevel: level,
                },
            };
        }

        if (isGemini25) {
            const budget = DEFAULT_THINKING_BUDGETS.MEDIUM;
            this.logger.log(`Auto-selecting Gemini 2.5 thinking budget: ${budget} tokens`);

            return {
                thinkingConfig: {
                    thinkingBudget: budget,
                },
            };
        }

        return undefined;
    }

    /**
     * Extract thoughts from response
     * Thoughts are included in candidates when thinking mode is enabled
     */
    extractThoughts(response: any): string[] {
        const thoughts: string[] = [];

        if (!response.candidates || response.candidates.length === 0) {
            return thoughts;
        }

        const candidate = response.candidates[0];

        // Check for thought content in parts
        if (candidate.content?.parts) {
            for (const part of candidate.content.parts) {
                if (part.thought) {
                    thoughts.push(part.thought);
                }
            }
        }

        // Check for thought metadata
        if (candidate.thinkingMetadata) {
            this.logger.debug('Thinking metadata:', candidate.thinkingMetadata);
        }

        return thoughts;
    }

    /**
     * Extract thought signature
     * Used for function calling with thinking mode
     */
    extractThoughtSignature(response: any): string | undefined {
        if (!response.candidates || response.candidates.length === 0) {
            return undefined;
        }

        const candidate = response.candidates[0];
        return candidate.thoughtSignature;
    }

    /**
     * Check if response includes thoughts
     */
    hasThoughts(response: any): boolean {
        return this.extractThoughts(response).length > 0;
    }

    /**
     * Get recommended thinking budget based on query complexity
     */
    getRecommendedBudget(queryLength: number): number {
        if (queryLength < 100) {
            return DEFAULT_THINKING_BUDGETS.LOW;
        } else if (queryLength < 500) {
            return DEFAULT_THINKING_BUDGETS.MEDIUM;
        } else {
            return DEFAULT_THINKING_BUDGETS.HIGH;
        }
    }

    /**
     * Validate thinking config
     */
    validateThinkingConfig(
        modelId: GeminiModelId,
        thinkingConfig?: ThinkingConfigDto,
    ): boolean {
        if (!thinkingConfig) {
            return true;
        }

        const isGemini3 = this.config.supportsThinkingLevel(modelId);
        const isGemini25 = this.config.supportsThinkingBudget(modelId);

        // Check if using correct config for model
        if (thinkingConfig.thinkingLevel && !isGemini3) {
            this.logger.warn('thinkingLevel is only supported on Gemini 3 models');
            return false;
        }

        if (thinkingConfig.thinkingBudget !== undefined && !isGemini25) {
            this.logger.warn('thinkingBudget is only supported on Gemini 2.5 models');
            return false;
        }

        // Validate budget range
        if (thinkingConfig.thinkingBudget !== undefined) {
            if (thinkingConfig.thinkingBudget < 1 || thinkingConfig.thinkingBudget > 10000) {
                this.logger.warn('thinkingBudget should be between 1 and 10000');
                return false;
            }
        }

        return true;
    }
}
