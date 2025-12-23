/**
 * AI Models and Constants for Unified AI Provider
 */

export const AI_MODELS = {
    // Gemini 2.5 models (latest)
    'gemini-2.5-pro': {
        id: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        description: 'Most capable model for complex tasks',
        supportsThinking: true,
        thinkingType: 'budget',
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        vertexResource: 'projects/{project}/locations/{location}/publishers/google/models/gemini-2.5-pro',
    },
    'gemini-2.5-flash': {
        id: 'gemini-2.5-flash',
        displayName: 'Gemini 2.5 Flash',
        description: 'Fast and versatile model for most tasks',
        supportsThinking: true,
        thinkingType: 'budget',
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        vertexResource: 'projects/{project}/locations/{location}/publishers/google/models/gemini-2.5-flash',
    },
    'gemini-2.5-flash-lite': {
        id: 'gemini-2.5-flash-lite',
        displayName: 'Gemini 2.5 Flash Lite',
        description: 'Lightweight and extremely fast model',
        supportsThinking: true,
        thinkingType: 'budget',
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        vertexResource: 'projects/{project}/locations/{location}/publishers/google/models/gemini-2.5-flash-lite',
    },

    // Gemini 2.0 models
    'gemini-2.0-flash': {
        id: 'gemini-2.0-flash',
        displayName: 'Gemini 2.0 Flash',
        description: 'Production-ready fast model',
        supportsThinking: false,
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        vertexResource: 'projects/{project}/locations/{location}/publishers/google/models/gemini-2.0-flash',
    },

    // Gemini 1.5 models
    'gemini-1.5-pro': {
        id: 'gemini-1.5-pro',
        displayName: 'Gemini 1.5 Pro',
        description: 'Large context window (2M tokens)',
        supportsThinking: false,
        maxInputTokens: 2097152,
        maxOutputTokens: 8192,
        vertexResource: 'projects/{project}/locations/{location}/publishers/google/models/gemini-1.5-pro',
    },
    'gemini-1.5-flash': {
        id: 'gemini-1.5-flash',
        displayName: 'Gemini 1.5 Flash',
        description: 'High-efficiency model',
        supportsThinking: false,
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        vertexResource: 'projects/{project}/locations/{location}/publishers/google/models/gemini-1.5-flash',
    },
} as const;

export type AiModelId = keyof typeof AI_MODELS;

export const DEFAULT_AI_MODEL: AiModelId = 'gemini-2.5-flash';

export const AI_CONFIG_DEFAULTS = {
    LOCATION: 'us-central1',
    ENDPOINT: 'aiplatform.googleapis.com',
};
