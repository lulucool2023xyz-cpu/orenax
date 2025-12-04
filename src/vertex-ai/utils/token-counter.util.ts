import { Content, Part } from '../types/vertex-ai.types';

/**
 * Token counting utility
 * Provides rough estimates for token counting
 */
export class TokenCounterUtil {
    /**
     * Estimate tokens from text (rough approximation)
     * Average: 1 token ≈ 4 characters
     */
    static estimateTextTokens(text: string): number {
        if (!text) return 0;
        return Math.ceil(text.length / 4);
    }

    /**
     * Estimate tokens from a Part
     */
    static estimatePartTokens(part: Part): number {
        if (part.text) {
            return this.estimateTextTokens(part.text);
        }

        // For multimodal content, use fixed estimates
        if (part.inlineData || part.fileData) {
            // Images: ~258 tokens, Videos: variable
            return 258;
        }

        if (part.functionCall || part.functionResponse) {
            // Function calls are typically small
            return 50;
        }

        return 0;
    }

    /**
     * Estimate tokens from Content
     */
    static estimateContentTokens(content: Content): number {
        if (!content.parts || content.parts.length === 0) {
            return 0;
        }

        return content.parts.reduce((total, part) => {
            return total + this.estimatePartTokens(part);
        }, 0);
    }

    /**
     * Estimate tokens from array of Contents (conversation history)
     */
    static estimateConversationTokens(contents: Content[]): number {
        return contents.reduce((total, content) => {
            return total + this.estimateContentTokens(content);
        }, 0);
    }

    /**
     * Format token usage for logging
     */
    static formatTokenUsage(promptTokens: number, responseTokens: number): string {
        const total = promptTokens + responseTokens;
        return `Tokens: ${total} (prompt: ${promptTokens}, response: ${responseTokens})`;
    }

    /**
     * Check if token count exceeds limit
     */
    static exceedsLimit(tokenCount: number, limit: number): boolean {
        return tokenCount > limit;
    }

    /**
     * Calculate estimated cost (rough approximation in USD)
     * Gemini 2.5 Flash: $0.075 / 1M input tokens, $0.30 / 1M output tokens
     */
    static estimateCost(inputTokens: number, outputTokens: number): number {
        const inputCost = (inputTokens / 1_000_000) * 0.075;
        const outputCost = (outputTokens / 1_000_000) * 0.30;
        return inputCost + outputCost;
    }
}
