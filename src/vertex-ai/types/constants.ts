/**
 * Constants for Vertex AI Integration
 */

/**
 * Supported Gemini models
 */
export const GEMINI_MODELS = {
    // Gemini 3 Preview models (latest, with thinkingLevel)
    'gemini-3-pro-preview': 'projects/{project}/locations/{location}/publishers/google/models/gemini-3-pro-preview',
    'gemini-3-pro-image-preview': 'projects/{project}/locations/{location}/publishers/google/models/gemini-3-pro-image-preview',

    // Gemini 2.5 models (stable, with thinkingBudget support)
    'gemini-2.5-pro': 'projects/{project}/locations/{location}/publishers/google/models/gemini-2.5-pro',
    'gemini-2.5-flash': 'projects/{project}/locations/{location}/publishers/google/models/gemini-2.5-flash',
    'gemini-2.5-flash-lite': 'projects/{project}/locations/{location}/publishers/google/models/gemini-2.5-flash-lite',
    'gemini-2.5-flash-image': 'projects/{project}/locations/{location}/publishers/google/models/gemini-2.5-flash-image',
    'gemini-2.5-flash-tts': 'projects/{project}/locations/{location}/publishers/google/models/gemini-2.5-flash-tts',
    'gemini-2.5-pro-tts': 'projects/{project}/locations/{location}/publishers/google/models/gemini-2.5-pro-tts',

    // Gemini 2.0 models (production-ready)
    'gemini-2.0-flash': 'projects/{project}/locations/{location}/publishers/google/models/gemini-2.0-flash',
    'gemini-2.0-flash-lite': 'projects/{project}/locations/{location}/publishers/google/models/gemini-2.0-flash-lite',

    // Gemini 1.5 models (legacy, still supported)
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

/**
 * Imagen models for image generation/editing
 */
export const IMAGEN_MODELS = {
    // Imagen 4 (latest)
    'imagen-4.0-generate-001': 'imagen-4.0-generate-001',
    'imagen-4.0-fast-generate-001': 'imagen-4.0-fast-generate-001',
    'imagen-4.0-ultra-generate-001': 'imagen-4.0-ultra-generate-001',
    'imagen-4.0-upscale-preview': 'imagen-4.0-upscale-preview',

    // Imagen 3
    'imagen-3.0-generate-002': 'imagen-3.0-generate-002',
    'imagen-3.0-generate-001': 'imagen-3.0-generate-001',
    'imagen-3.0-fast-generate-001': 'imagen-3.0-fast-generate-001',
    'imagen-3.0-capability-001': 'imagen-3.0-capability-001', // Editing/customization

    // Special use
    'imagen-product-recontext-preview-06-30': 'imagen-product-recontext-preview-06-30',
    'virtual-try-on-preview-08-04': 'virtual-try-on-preview-08-04',
} as const;

export type ImagenModelId = keyof typeof IMAGEN_MODELS;

/**
 * Veo models for video generation
 */
export const VEO_MODELS = {
    // Veo 3.1 (latest)
    'veo-3.1-generate-001': 'veo-3.1-generate-001',
    'veo-3.1-fast-generate-001': 'veo-3.1-fast-generate-001',
    'veo-3.1-generate-preview': 'veo-3.1-generate-preview',
    'veo-3.1-fast-generate-preview': 'veo-3.1-fast-generate-preview',

    // Veo 3.0
    'veo-3.0-generate-001': 'veo-3.0-generate-001',
    'veo-3.0-fast-generate-001': 'veo-3.0-fast-generate-001',
    'veo-3.0-generate-preview': 'veo-3.0-generate-preview',
    'veo-3.0-fast-generate-preview': 'veo-3.0-fast-generate-preview',

    // Veo 2.0
    'veo-2.0-generate-001': 'veo-2.0-generate-001',
    'veo-2.0-generate-exp': 'veo-2.0-generate-exp',
    'veo-2.0-generate-preview': 'veo-2.0-generate-preview',
} as const;

export type VeoModelId = keyof typeof VEO_MODELS;

/**
 * Lyria models for music generation
 */
export const LYRIA_MODELS = {
    'lyria-002': 'lyria-002',
} as const;

export type LyriaModelId = keyof typeof LYRIA_MODELS;

/**
 * Veo video generation parameters
 */
export const VEO_DEFAULTS = {
    aspectRatio: '16:9',
    durationSeconds: 8,
    resolution: '720p',
    sampleCount: 1,
};

/**
 * Lyria music generation parameters
 */
export const LYRIA_DEFAULTS = {
    sampleCount: 1,
    durationSeconds: 30, // Fixed 30 seconds output
    sampleRate: 48000,   // 48kHz
    format: 'audio/wav',
};

/**
 * Image aspect ratios supported
 */
export const IMAGE_ASPECT_RATIOS = [
    '1:1', '3:2', '2:3', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9',
] as const;

/**
 * Video aspect ratios supported
 */
export const VIDEO_ASPECT_RATIOS = ['16:9', '9:16'] as const;

/**
 * Person generation settings
 */
export const PERSON_GENERATION = {
    DONT_ALLOW: 'dont_allow',
    ALLOW_ADULT: 'allow_adult',
    ALLOW_ALL: 'allow_all',
} as const;

/**
 * Safety settings for media generation
 */
export const SAFETY_SETTINGS = {
    BLOCK_LOW_AND_ABOVE: 'block_low_and_above',
    BLOCK_MEDIUM_AND_ABOVE: 'block_medium_and_above',
    BLOCK_ONLY_HIGH: 'block_only_high',
    BLOCK_NONE: 'block_none',
} as const;

/**
 * Upscale factors
 */
export const UPSCALE_FACTORS = ['x2', 'x3', 'x4'] as const;

