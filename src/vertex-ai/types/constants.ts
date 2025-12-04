/**
 * Constants for Vertex AI Integration
 */

/**
 * Supported Gemini models
 */
export const GEMINI_MODELS = {
    // Gemini 2.5 models (stable, with thinking mode support)
    'gemini-2.5-pro': 'projects/{project}/locations/{location}/publishers/google/models/gemini-2.5-pro',
    'gemini-2.5-flash': 'projects/{project}/locations/{location}/publishers/google/models/gemini-2.5-flash',

    // Gemini 1.5 models (production-ready, stable)
    'gemini-1.5-pro': 'projects/{project}/locations/{location}/publishers/google/models/gemini-1.5-pro',
    'gemini-1.5-flash': 'projects/{project}/locations/{location}/publishers/google/models/gemini-1.5-flash',
} as const;

export type GeminiModelId = keyof typeof GEMINI_MODELS;

/**
 * Default generation configuration
 */
export const DEFAULT_GENERATION_CONFIG = {
    temperature: 1.0,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    candidateCount: 1,
};

/**
 * Default safety settings - Permissive for development
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
];

/**
 * OrenaX Agent system instruction
 */
export const ORENAX_SYSTEM_INSTRUCTION = {
    role: 'user',
    parts: [
        {
            text: `Kamu adalah OrenaX Agent, asisten AI yang dikembangkan dengan teknologi terdepan dari Google Cloud Vertex AI.

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

**Pedoman:**
- Selalu perkenalkan diri sebagai "OrenaX Agent" pada percakapan pertama
- Berikan jawaban yang akurat dan relevan
- Jika tidak yakin, katakan dengan jujur
- Gunakan emoji dengan bijak untuk komunikasi yang lebih baik

Selamat membantu! 🚀`,
        },
    ],
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
    INVALID_MODEL: 'Model yang dipilih tidak valid',
    MISSING_API_KEY: 'Google Cloud credentials tidak ditemukan',
    INVALID_REQUEST: 'Request tidak valid',
    QUOTA_EXCEEDED: 'Quota API telah habis',
    SERVICE_UNAVAILABLE: 'Service Vertex AI sedang tidak tersedia',
    UNAUTHORIZED: 'Tidak memiliki akses ke Vertex AI',
    RATE_LIMIT: 'Terlalu banyak request, coba lagi nanti',
    INTERNAL_ERROR: 'Terjadi kesalahan internal',
};

/**
 * Token limits per model
 */
export const MODEL_TOKEN_LIMITS = {
    'gemini-2.5-pro': {
        input: 1048576, // 1M tokens
        output: 8192,
    },
    'gemini-2.5-flash': {
        input: 1048576, // 1M tokens
        output: 8192,
    },
    'gemini-1.5-pro': {
        input: 2097152, // 2M tokens
        output: 8192,
    },
    'gemini-1.5-flash': {
        input: 1048576, // 1M tokens
        output: 8192,
    },
};

/**
 * Default thinking mode budgets
 */
export const DEFAULT_THINKING_BUDGETS = {
    LOW: 512,
    MEDIUM: 1024,
    HIGH: 2048,
};

/**
 * Supported MIME types for multimodal input
 */
export const SUPPORTED_MIME_TYPES = {
    // Images
    IMAGE: ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'],

    // Audio
    AUDIO: ['audio/wav', 'audio/mp3', 'audio/aiff', 'audio/aac', 'audio/ogg', 'audio/flac'],

    // Video
    VIDEO: ['video/mp4', 'video/mpeg', 'video/mov', 'video/avi', 'video/x-flv', 'video/mpg', 'video/webm', 'video/wmv', 'video/3gpp'],

    // Documents
    PDF: ['application/pdf'],

    // Text
    TEXT: ['text/plain', 'text/html', 'text/css', 'text/javascript', 'application/json'],
};

/**
 * API endpoint configuration
 */
export const API_CONFIG = {
    DEFAULT_LOCATION: 'us-central1',
    DEFAULT_ENDPOINT: 'aiplatform.googleapis.com',
    API_VERSION: 'v1',
};

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
    MAX_RETRIES: 3,
    INITIAL_DELAY_MS: 1000,
    MAX_DELAY_MS: 10000,
    BACKOFF_MULTIPLIER: 2,
};
