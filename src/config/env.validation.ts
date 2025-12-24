import * as Joi from 'joi';

/**
 * Environment Validation Schema
 * Validates required environment variables at startup
 * Uses Joi for comprehensive validation
 */
export const envValidationSchema = Joi.object({
    // Server
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().default(3001),

    // Supabase - Important but optional to allow startup
    // The app will log warnings if these are missing
    SUPABASE_URL: Joi.string().uri().optional(),
    SUPABASE_KEY: Joi.string().optional(),
    SUPABASE_SERVICE_ROLE_KEY: Joi.string().optional(),

    // JWT
    JWT_SECRET: Joi.string().min(32).optional()
        .messages({ 'string.min': 'JWT_SECRET should be at least 32 characters' }),

    // Gemini API (At least one AI provider needed)
    GEMINI_API_KEY: Joi.string().optional(),

    // Vertex AI (Alternative provider)
    GOOGLE_CLOUD_PROJECT: Joi.string().optional(),
    GOOGLE_CLOUD_LOCATION: Joi.string().optional(),
    GOOGLE_APPLICATION_CREDENTIALS: Joi.string().optional(),

    // GCS Storage (Optional)
    GCS_BUCKET_NAME: Joi.string().optional(),
    GCS_KEY_FILE: Joi.string().optional(),

    // OAuth Providers (Optional)
    GOOGLE_CLIENT_ID: Joi.string().optional(),
    GOOGLE_CLIENT_SECRET: Joi.string().optional(),
    FACEBOOK_APP_ID: Joi.string().optional(),
    FACEBOOK_APP_SECRET: Joi.string().optional(),
    GITHUB_CLIENT_ID: Joi.string().optional(),
    GITHUB_CLIENT_SECRET: Joi.string().optional(),

    // Frontend URLs
    APP_URL: Joi.string().uri().optional(),
    OAUTH_REDIRECT_URL: Joi.string().uri().optional(),
    CORS_ORIGINS: Joi.string().optional(),

    // Midtrans Payment (Optional)
    MIDTRANS_SERVER_KEY: Joi.string().optional(),
    MIDTRANS_CLIENT_KEY: Joi.string().optional(),
    MIDTRANS_IS_PRODUCTION: Joi.boolean().default(false),
}).options({ allowUnknown: true }); // Allow other env vars
