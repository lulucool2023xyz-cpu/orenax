/**
 * Gemini API Constants
 * Based on Official Google Gemini API Documentation
 */

/**
 * Supported Gemini Models for API v2
 */
export const GEMINI_MODELS = {
    'gemini-3-pro-preview': {
        name: 'gemini-3-pro-preview',
        displayName: 'Gemini 3 Pro Preview',
        description: 'Latest model with enhanced thinking (thinkingLevel)',
        supportsThinking: true,
        thinkingType: 'level', // thinkingLevel: 'low' | 'high'
        maxInputTokens: 1048576,
        maxOutputTokens: 65536,
        supportedFeatures: ['text', 'image', 'video', 'audio', 'pdf', 'function-calling', 'json-mode', 'streaming'],
    },
    'gemini-2.5-pro': {
        name: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        description: 'Premium model with thinking budget support',
        supportsThinking: true,
        thinkingType: 'budget', // thinkingBudget: 128-32768 or -1
        maxInputTokens: 1048576,
        maxOutputTokens: 65536,
        supportedFeatures: ['text', 'image', 'video', 'audio', 'pdf', 'function-calling', 'json-mode', 'streaming'],
    },
    'gemini-2.5-flash': {
        name: 'gemini-2.5-flash',
        displayName: 'Gemini 2.5 Flash',
        description: 'Fast model with thinking budget support',
        supportsThinking: true,
        thinkingType: 'budget', // thinkingBudget: 0-24576 or -1
        maxInputTokens: 1048576,
        maxOutputTokens: 65536,
        supportedFeatures: ['text', 'image', 'video', 'audio', 'pdf', 'function-calling', 'json-mode', 'streaming'],
    },
    'gemini-2.0-flash': {
        name: 'gemini-2.0-flash',
        displayName: 'Gemini 2.0 Flash',
        description: 'Production-ready fast model without thinking',
        supportsThinking: false,
        thinkingType: null,
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        supportedFeatures: ['text', 'image', 'video', 'audio', 'pdf', 'function-calling', 'json-mode', 'streaming'],
    },
} as const;

export type GeminiModelId = keyof typeof GEMINI_MODELS;

/**
 * Default Model
 */
export const DEFAULT_MODEL: GeminiModelId = 'gemini-2.0-flash';

/**
 * Default Generation Configuration
 */
export const DEFAULT_GENERATION_CONFIG = {
    temperature: 1.0,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    candidateCount: 1,
};

/**
 * Default Safety Settings
 * Based on official Gemini API harm categories
 */
export const DEFAULT_SAFETY_SETTINGS = [
    {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
    },
    {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
    },
    {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_ONLY_HIGH',
    },
    {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_ONLY_HIGH',
    },
    {
        category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
        threshold: 'BLOCK_ONLY_HIGH',
    },
];

/**
 * Harm Categories
 */
export const HARM_CATEGORIES = [
    'HARM_CATEGORY_HATE_SPEECH',
    'HARM_CATEGORY_DANGEROUS_CONTENT',
    'HARM_CATEGORY_HARASSMENT',
    'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    'HARM_CATEGORY_CIVIC_INTEGRITY',
] as const;

export type HarmCategory = (typeof HARM_CATEGORIES)[number];

/**
 * Safety Thresholds
 */
export const SAFETY_THRESHOLDS = [
    'BLOCK_NONE',
    'BLOCK_ONLY_HIGH',
    'BLOCK_MEDIUM_AND_ABOVE',
    'BLOCK_LOW_AND_ABOVE',
] as const;

export type SafetyThreshold = (typeof SAFETY_THRESHOLDS)[number];

/**
 * Function Calling Modes
 */
export const FUNCTION_CALLING_MODES = [
    'AUTO',      // Model decides when to call functions
    'ANY',       // Model must call at least one function
    'NONE',      // Model cannot call functions
    'VALIDATED', // Model uses validated function calling
] as const;

export type FunctionCallingMode = (typeof FUNCTION_CALLING_MODES)[number];

/**
 * Finish Reasons
 */
export const FINISH_REASONS = [
    'FINISH_REASON_UNSPECIFIED',
    'STOP',                      // Natural stop or stop sequence
    'MAX_TOKENS',                // Max tokens reached
    'SAFETY',                    // Blocked for safety
    'RECITATION',                // Blocked for recitation
    'LANGUAGE',                  // Unsupported language
    'OTHER',                     // Unknown reason
    'BLOCKLIST',                 // Forbidden terms
    'PROHIBITED_CONTENT',        // Prohibited content
    'SPII',                      // Sensitive PII
    'MALFORMED_FUNCTION_CALL',   // Invalid function call
    'IMAGE_SAFETY',              // Image safety violation
    'IMAGE_PROHIBITED_CONTENT',  // Image prohibited content
    'IMAGE_OTHER',               // Image other issue
    'NO_IMAGE',                  // No image generated
    'IMAGE_RECITATION',          // Image recitation
    'UNEXPECTED_TOOL_CALL',      // No tools enabled
    'TOO_MANY_TOOL_CALLS',       // Too many tool calls
    'MISSING_THOUGHT_SIGNATURE', // Missing thought signature
] as const;

export type FinishReason = (typeof FINISH_REASONS)[number];

/**
 * Thinking Levels (for Gemini 3 models)
 */
export const THINKING_LEVELS = ['low', 'high'] as const;
export type ThinkingLevel = (typeof THINKING_LEVELS)[number];

/**
 * Default Thinking Configuration per Model
 */
export const DEFAULT_THINKING_CONFIG = {
    'gemini-3-pro-preview': {
        thinkingLevel: 'high' as ThinkingLevel,
    },
    'gemini-2.5-pro': {
        thinkingBudget: -1, // -1 for dynamic
    },
    'gemini-2.5-flash': {
        thinkingBudget: 1024,
    },
    'gemini-2.0-flash': null, // No thinking support
};

/**
 * Thinking Budget Limits
 */
export const THINKING_BUDGET_LIMITS = {
    'gemini-2.5-pro': {
        min: 128,
        max: 32768,
    },
    'gemini-2.5-flash': {
        min: 0, // 0 disables thinking
        max: 24576,
    },
};

/**
 * Supported MIME Types for Multimodal Input
 */
export const SUPPORTED_MIME_TYPES = {
    // Images
    IMAGE: [
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/heic',
        'image/heif',
        'image/gif',
    ],

    // Audio
    AUDIO: [
        'audio/wav',
        'audio/mp3',
        'audio/mpeg',
        'audio/aiff',
        'audio/aac',
        'audio/ogg',
        'audio/flac',
    ],

    // Video
    VIDEO: [
        'video/mp4',
        'video/mpeg',
        'video/mov',
        'video/quicktime',
        'video/avi',
        'video/x-flv',
        'video/mpg',
        'video/webm',
        'video/wmv',
        'video/3gpp',
    ],

    // Documents
    DOCUMENT: ['application/pdf'],

    // Text
    TEXT: [
        'text/plain',
        'text/html',
        'text/css',
        'text/javascript',
        'application/json',
        'text/markdown',
    ],
};

/**
 * File Size Limits
 */
export const FILE_SIZE_LIMITS = {
    INLINE_MAX_SIZE: 20 * 1024 * 1024, // 20MB - use Files API for larger
    VIDEO_INLINE_MAX: 20 * 1024 * 1024,
    AUDIO_INLINE_MAX: 20 * 1024 * 1024,
};

/**
 * OrenaX Agent System Instruction (default)
 */
export const DEFAULT_SYSTEM_INSTRUCTION = `Kamu adalah OrenaX Agent, asisten AI yang dikembangkan dengan teknologi terdepan dari Google Gemini API.

**Kepribadian:**
- Berbasis budaya Indonesia dengan sopan dan ramah
- Komunikatif dan mudah dipahami
- Profesional namun tetap hangat
- Siap membantu dalam berbagai topik

**Kemampuan:**
- Menjawab pertanyaan dengan konteks yang tepat
- Menggunakan bahasa Indonesia yang baik dan benar
- Dapat beralih ke bahasa Inggris jika diminta
- Memahami konteks percakapan multi-turn
- Mendukung analisis gambar, audio, video, dan dokumen

**Pedoman:**
- Selalu perkenalkan diri sebagai "OrenaX Agent" pada percakapan pertama
- Berikan jawaban yang akurat dan relevan
- Jika tidak yakin, katakan dengan jujur
- Gunakan emoji dengan bijak untuk komunikasi yang lebih baik

Selamat membantu! 🚀`;

/**
 * API Error Messages
 */
export const ERROR_MESSAGES = {
    INVALID_MODEL: 'Model yang dipilih tidak valid',
    MISSING_API_KEY: 'GEMINI_API_KEY tidak ditemukan',
    INVALID_REQUEST: 'Request tidak valid',
    QUOTA_EXCEEDED: 'Quota API telah habis',
    SERVICE_UNAVAILABLE: 'Service Gemini API sedang tidak tersedia',
    UNAUTHORIZED: 'API key tidak valid atau tidak memiliki akses',
    RATE_LIMIT: 'Terlalu banyak request, coba lagi nanti',
    INTERNAL_ERROR: 'Terjadi kesalahan internal',
    SAFETY_BLOCKED: 'Konten diblokir karena alasan keamanan',
    INVALID_CONTENT: 'Format konten tidak valid',
    FILE_TOO_LARGE: 'File terlalu besar, gunakan Files API',
    UNSUPPORTED_MIME_TYPE: 'Tipe file tidak didukung',
    INVALID_THINKING_CONFIG: 'Konfigurasi thinking tidak valid untuk model ini',
};
