import { Injectable, Logger } from '@nestjs/common';

/**
 * Safety filter levels
 */
export type SafetyFilterLevel = 'BLOCK_NONE' | 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_ONLY_HIGH';

/**
 * Harm categories
 */
export const HARM_CATEGORIES = {
    SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
    HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
    DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
} as const;

/**
 * Safety setting configuration
 */
export interface SafetySetting {
    category: string;
    threshold: SafetyFilterLevel;
}

/**
 * Preset safety profiles
 */
export const SAFETY_PRESETS = {
    // Most permissive - only blocks high probability harm
    PERMISSIVE: [
        { category: HARM_CATEGORIES.SEXUALLY_EXPLICIT, threshold: 'BLOCK_ONLY_HIGH' as SafetyFilterLevel },
        { category: HARM_CATEGORIES.HATE_SPEECH, threshold: 'BLOCK_ONLY_HIGH' as SafetyFilterLevel },
        { category: HARM_CATEGORIES.HARASSMENT, threshold: 'BLOCK_ONLY_HIGH' as SafetyFilterLevel },
        { category: HARM_CATEGORIES.DANGEROUS_CONTENT, threshold: 'BLOCK_ONLY_HIGH' as SafetyFilterLevel },
    ],
    // Default - blocks medium and above
    DEFAULT: [
        { category: HARM_CATEGORIES.SEXUALLY_EXPLICIT, threshold: 'BLOCK_MEDIUM_AND_ABOVE' as SafetyFilterLevel },
        { category: HARM_CATEGORIES.HATE_SPEECH, threshold: 'BLOCK_MEDIUM_AND_ABOVE' as SafetyFilterLevel },
        { category: HARM_CATEGORIES.HARASSMENT, threshold: 'BLOCK_MEDIUM_AND_ABOVE' as SafetyFilterLevel },
        { category: HARM_CATEGORIES.DANGEROUS_CONTENT, threshold: 'BLOCK_MEDIUM_AND_ABOVE' as SafetyFilterLevel },
    ],
    // Most strict - blocks low and above
    STRICT: [
        { category: HARM_CATEGORIES.SEXUALLY_EXPLICIT, threshold: 'BLOCK_LOW_AND_ABOVE' as SafetyFilterLevel },
        { category: HARM_CATEGORIES.HATE_SPEECH, threshold: 'BLOCK_LOW_AND_ABOVE' as SafetyFilterLevel },
        { category: HARM_CATEGORIES.HARASSMENT, threshold: 'BLOCK_LOW_AND_ABOVE' as SafetyFilterLevel },
        { category: HARM_CATEGORIES.DANGEROUS_CONTENT, threshold: 'BLOCK_LOW_AND_ABOVE' as SafetyFilterLevel },
    ],
} as const;

/**
 * Safety Filter Service
 * 
 * Phase 10: Safety settings configuration for Gemini API
 */
@Injectable()
export class SafetyFilterService {
    private readonly logger = new Logger(SafetyFilterService.name);

    /**
     * Get safety settings by preset name
     */
    getPreset(preset: 'PERMISSIVE' | 'DEFAULT' | 'STRICT'): SafetySetting[] {
        return [...SAFETY_PRESETS[preset]];
    }

    /**
     * Build custom safety settings
     */
    buildCustomSettings(options: {
        sexuallyExplicit?: SafetyFilterLevel;
        hateSpeech?: SafetyFilterLevel;
        harassment?: SafetyFilterLevel;
        dangerousContent?: SafetyFilterLevel;
    }): SafetySetting[] {
        const settings: SafetySetting[] = [];

        if (options.sexuallyExplicit) {
            settings.push({ category: HARM_CATEGORIES.SEXUALLY_EXPLICIT, threshold: options.sexuallyExplicit });
        }
        if (options.hateSpeech) {
            settings.push({ category: HARM_CATEGORIES.HATE_SPEECH, threshold: options.hateSpeech });
        }
        if (options.harassment) {
            settings.push({ category: HARM_CATEGORIES.HARASSMENT, threshold: options.harassment });
        }
        if (options.dangerousContent) {
            settings.push({ category: HARM_CATEGORIES.DANGEROUS_CONTENT, threshold: options.dangerousContent });
        }

        return settings;
    }

    /**
     * Check if response was blocked
     */
    isBlocked(response: any): boolean {
        const candidate = response?.candidates?.[0];
        if (!candidate) return true;

        const finishReason = candidate.finishReason;
        return finishReason === 'SAFETY' || finishReason === 'BLOCKED';
    }

    /**
     * Get block reason from response
     */
    getBlockReason(response: any): string | undefined {
        const candidate = response?.candidates?.[0];
        if (!candidate || candidate.finishReason !== 'SAFETY') {
            return undefined;
        }

        const ratings = candidate.safetyRatings || [];
        const blockedRating = ratings.find((r: any) => r.blocked);

        if (blockedRating) {
            return `Blocked by ${blockedRating.category} (probability: ${blockedRating.probability})`;
        }
        return 'Content blocked by safety filters';
    }

    /**
     * Extract safety ratings from response
     */
    extractSafetyRatings(response: any): any[] {
        return response?.candidates?.[0]?.safetyRatings || [];
    }
}
