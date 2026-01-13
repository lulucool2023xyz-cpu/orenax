/**
 * Redis Service
 * Provides caching with automatic fallback to in-memory storage
 * when Redis is not available (development mode)
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CacheEntry {
    value: unknown;
    expiry: number | null;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private redisClient: any = null;
    private isConnected = false;
    private readonly memoryCache = new Map<string, CacheEntry>();

    // Configuration
    private readonly redisUrl: string;
    private readonly defaultTTL: number;
    private readonly useMemoryFallback: boolean;

    constructor(private readonly configService: ConfigService) {
        this.redisUrl = this.configService.get<string>('REDIS_URL', '');
        this.defaultTTL = this.configService.get<number>('REDIS_TTL_DEFAULT', 3600);
        this.useMemoryFallback = !this.redisUrl;

        if (this.useMemoryFallback) {
            this.logger.warn('Redis URL not configured. Using in-memory cache (development mode).');
        }
    }

    async onModuleInit(): Promise<void> {
        if (!this.useMemoryFallback) {
            await this.connect();
        }
    }

    async onModuleDestroy(): Promise<void> {
        if (this.redisClient) {
            await this.redisClient.quit();
            this.logger.log('Redis connection closed');
        }
    }

    /**
     * Connect to Redis
     */
    private async connect(): Promise<void> {
        try {
            // Dynamic import for ioredis
            const Redis = (await import('ioredis')).default;

            // Create Redis client with URL
            this.redisClient = new (Redis as any)(this.redisUrl);

            this.redisClient.on('connect', () => {
                this.isConnected = true;
                this.logger.log('Redis connected successfully');
            });

            this.redisClient.on('error', (err: Error) => {
                this.logger.error(`Redis error: ${err.message}`);
                this.isConnected = false;
            });

            this.redisClient.on('close', () => {
                this.isConnected = false;
                this.logger.warn('Redis connection closed');
            });
        } catch (error: any) {
            this.logger.error(`Failed to connect to Redis: ${error?.message || error}`);
            this.logger.warn('Falling back to in-memory cache');
            this.redisClient = null;
        }
    }

    /**
     * Check if using Redis or memory fallback
     */
    isUsingRedis(): boolean {
        return this.isConnected && this.redisClient !== null;
    }

    /**
     * Get cache status
     */
    getStatus(): { connected: boolean; type: 'redis' | 'memory' } {
        return {
            connected: this.isConnected || this.useMemoryFallback,
            type: this.isUsingRedis() ? 'redis' : 'memory',
        };
    }

    // ============================================
    // Core Cache Operations
    // ============================================

    /**
     * Get value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        if (this.isUsingRedis()) {
            const value = await this.redisClient.get(key);
            return value ? JSON.parse(value) : null;
        }

        // Memory fallback
        const entry = this.memoryCache.get(key);
        if (!entry) return null;

        // Check expiry
        if (entry.expiry && entry.expiry < Date.now()) {
            this.memoryCache.delete(key);
            return null;
        }

        return entry.value as T;
    }

    /**
     * Set value in cache
     */
    async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
        const ttl = ttlSeconds ?? this.defaultTTL;
        const serialized = JSON.stringify(value);

        if (this.isUsingRedis()) {
            if (ttl > 0) {
                await this.redisClient.setex(key, ttl, serialized);
            } else {
                await this.redisClient.set(key, serialized);
            }
            return;
        }

        // Memory fallback
        this.memoryCache.set(key, {
            value,
            expiry: ttl > 0 ? Date.now() + ttl * 1000 : null,
        });
    }

    /**
     * Delete value from cache
     */
    async del(key: string): Promise<void> {
        if (this.isUsingRedis()) {
            await this.redisClient.del(key);
            return;
        }

        this.memoryCache.delete(key);
    }

    /**
     * Check if key exists
     */
    async exists(key: string): Promise<boolean> {
        if (this.isUsingRedis()) {
            return (await this.redisClient.exists(key)) === 1;
        }

        const entry = this.memoryCache.get(key);
        if (!entry) return false;

        if (entry.expiry && entry.expiry < Date.now()) {
            this.memoryCache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Delete all keys matching pattern
     */
    async delPattern(pattern: string): Promise<number> {
        if (this.isUsingRedis()) {
            const keys = await this.redisClient.keys(pattern);
            if (keys.length === 0) return 0;
            return await this.redisClient.del(...keys);
        }

        // Memory fallback - simple pattern matching
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        let deleted = 0;

        for (const key of this.memoryCache.keys()) {
            if (regex.test(key)) {
                this.memoryCache.delete(key);
                deleted++;
            }
        }

        return deleted;
    }

    /**
     * Get time-to-live for a key
     */
    async ttl(key: string): Promise<number> {
        if (this.isUsingRedis()) {
            return await this.redisClient.ttl(key);
        }

        const entry = this.memoryCache.get(key);
        if (!entry || !entry.expiry) return -1;

        const remaining = Math.ceil((entry.expiry - Date.now()) / 1000);
        return remaining > 0 ? remaining : -2;
    }

    // ============================================
    // Hash Operations
    // ============================================

    async hset(key: string, field: string, value: unknown): Promise<void> {
        const serialized = JSON.stringify(value);

        if (this.isUsingRedis()) {
            await this.redisClient.hset(key, field, serialized);
            return;
        }

        // Memory fallback
        const hash = (this.memoryCache.get(key)?.value as Record<string, string>) || {};
        hash[field] = serialized;
        this.memoryCache.set(key, { value: hash, expiry: null });
    }

    async hget<T>(key: string, field: string): Promise<T | null> {
        if (this.isUsingRedis()) {
            const value = await this.redisClient.hget(key, field);
            return value ? JSON.parse(value) : null;
        }

        const hash = this.memoryCache.get(key)?.value as Record<string, string>;
        if (!hash || !hash[field]) return null;
        return JSON.parse(hash[field]);
    }

    async hgetall<T>(key: string): Promise<Record<string, T> | null> {
        if (this.isUsingRedis()) {
            const hash = await this.redisClient.hgetall(key);
            if (!hash || Object.keys(hash).length === 0) return null;

            const result: Record<string, T> = {};
            for (const [field, value] of Object.entries(hash)) {
                result[field] = JSON.parse(value as string);
            }
            return result;
        }

        const hash = this.memoryCache.get(key)?.value as Record<string, string>;
        if (!hash) return null;

        const result: Record<string, T> = {};
        for (const [field, value] of Object.entries(hash)) {
            result[field] = JSON.parse(value);
        }
        return result;
    }

    // ============================================
    // Rate Limiting Support
    // ============================================

    /**
     * Increment a counter with TTL (for rate limiting)
     */
    async incr(key: string, ttlSeconds?: number): Promise<number> {
        if (this.isUsingRedis()) {
            const count = await this.redisClient.incr(key);
            if (ttlSeconds && count === 1) {
                await this.redisClient.expire(key, ttlSeconds);
            }
            return count;
        }

        // Memory fallback
        const entry = this.memoryCache.get(key);
        let count = 1;

        if (entry && (!entry.expiry || entry.expiry > Date.now())) {
            count = (entry.value as number) + 1;
        }

        this.memoryCache.set(key, {
            value: count,
            expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
        });

        return count;
    }

    /**
     * Get current count (for rate limit checking)
     */
    async getCount(key: string): Promise<number> {
        const value = await this.get<number>(key);
        return value ?? 0;
    }

    // ============================================
    // Utility Methods
    // ============================================

    /**
     * Flush all cache (use with caution)
     */
    async flushAll(): Promise<void> {
        if (this.isUsingRedis()) {
            await this.redisClient.flushall();
            return;
        }

        this.memoryCache.clear();
    }

    /**
     * Get cache size/stats
     */
    async getInfo(): Promise<{ keys: number; memory?: string }> {
        if (this.isUsingRedis()) {
            const info = await this.redisClient.info('memory');
            const keyCount = await this.redisClient.dbsize();
            return {
                keys: keyCount,
                memory: info.match(/used_memory_human:(.+)/)?.[1]?.trim(),
            };
        }

        return { keys: this.memoryCache.size };
    }
}
