import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';

/**
 * Rate limit presets for different operation types
 * These can be applied to individual controllers or endpoints
 */

// Skip rate limiting entirely for this endpoint
export const NoRateLimit = () => SkipThrottle();

// Standard API rate limit: 60 req/min (default)
export const StandardRateLimit = () => Throttle({ default: { limit: 60, ttl: 60000 } });

// Chat API rate limit: 30 req/min
export const ChatRateLimit = () => Throttle({ default: { limit: 30, ttl: 60000 } });

// Stricter limit for expensive operations: 10 req/min
export const GenerationRateLimit = () => Throttle({ default: { limit: 10, ttl: 60000 } });

// Very strict limit for heavy operations like video: 3 req/min
export const HeavyGenerationRateLimit = () => Throttle({ default: { limit: 3, ttl: 60000 } });
