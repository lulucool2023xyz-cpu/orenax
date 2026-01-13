/**
 * OpenRouter Configuration
 * Premium AI Models via OpenRouter API
 */

import { registerAs } from '@nestjs/config';
import { PREMIUM_MODELS } from '../types/openrouter.types';

export interface OpenRouterConfig {
    apiKey: string;
    baseUrl: string;
    defaultModel: string;
    fallbackModels: string[];
    siteUrl: string;
    siteName: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
}

export default registerAs('openrouter', (): OpenRouterConfig => ({
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || PREMIUM_MODELS.CLAUDE_SONNET_4_5,
    fallbackModels: [
        PREMIUM_MODELS.CLAUDE_OPUS_4_5,
        PREMIUM_MODELS.GPT_4O,
        PREMIUM_MODELS.GEMINI_2_5_PRO,
    ],
    siteUrl: process.env.OPENROUTER_SITE_URL || 'https://orenax.com',
    siteName: process.env.OPENROUTER_SITE_NAME || 'OrenaX AI Platform',
    timeout: parseInt(process.env.OPENROUTER_TIMEOUT || '120000', 10),
    retryAttempts: parseInt(process.env.OPENROUTER_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.OPENROUTER_RETRY_DELAY || '1000', 10),
}));

/**
 * Premium Model Tiers with descriptions
 */
export const MODEL_TIERS = {
    FLAGSHIP: {
        name: 'Flagship',
        description: 'Most capable models for complex reasoning',
        models: [
            PREMIUM_MODELS.CLAUDE_OPUS_4_5,
            PREMIUM_MODELS.GPT_5_2_PRO,
            PREMIUM_MODELS.O1_PRO,
        ],
    },
    BALANCED: {
        name: 'Balanced',
        description: 'Excellent capability with faster response',
        models: [
            PREMIUM_MODELS.CLAUDE_SONNET_4_5,
            PREMIUM_MODELS.GPT_5_2,
            PREMIUM_MODELS.GPT_4O,
            PREMIUM_MODELS.GEMINI_2_5_PRO,
        ],
    },
    FAST: {
        name: 'Fast',
        description: 'Quick responses for simpler tasks',
        models: [
            PREMIUM_MODELS.GEMINI_2_5_FLASH,
            PREMIUM_MODELS.GEMINI_3_FLASH,
        ],
    },
    VISION: {
        name: 'Vision',
        description: 'Best for image analysis',
        models: [
            PREMIUM_MODELS.CLAUDE_OPUS_4_5,
            PREMIUM_MODELS.GPT_4O,
            PREMIUM_MODELS.GEMINI_2_5_PRO,
        ],
    },
    AUDIO: {
        name: 'Audio',
        description: 'Audio processing capable',
        models: [
            PREMIUM_MODELS.GPT_4O_AUDIO,
            PREMIUM_MODELS.GEMINI_2_5_PRO,
        ],
    },
    CODING: {
        name: 'Coding',
        description: 'Optimized for code generation',
        models: [
            PREMIUM_MODELS.CLAUDE_SONNET_4_5,
            PREMIUM_MODELS.DEEPSEEK_R1,
            PREMIUM_MODELS.GPT_4O,
        ],
    },
} as const;
