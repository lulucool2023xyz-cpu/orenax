import { Injectable, Logger, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {
    CreateApiKeyDto,
    ApiKeysListResponse,
    CreateApiKeyResponse,
    ApiKeyItem,
    ApiUsageResponse,
} from './dto/api-keys.dto';

const MAX_API_KEYS = 5;
const DEFAULT_LIMITS = {
    chat: 100,
    image: 50,
    video: 10,
    music: 5,
    tts: 20,
};

/**
 * API Keys Service
 * Handles user API key generation, listing, and deletion
 */
@Injectable()
export class ApiKeysService {
    private readonly logger = new Logger(ApiKeysService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    /**
     * List all API keys for user (only shows prefix, not full key)
     */
    async listApiKeys(userId: string): Promise<ApiKeysListResponse> {
        try {
            const { data, error } = await this.supabaseService
                .getAdminClient()
                .from('user_api_keys')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const keys: ApiKeyItem[] = (data || []).map(key => ({
                id: key.id,
                name: key.name,
                prefix: key.prefix,
                createdAt: key.created_at,
                lastUsed: key.last_used_at,
                usageCount: key.usage_count || 0,
            }));

            return {
                keys,
                limit: MAX_API_KEYS,
                remaining: MAX_API_KEYS - keys.length,
            };
        } catch (error) {
            this.logger.error(`Failed to list API keys: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generate a new API key for user
     */
    async createApiKey(userId: string, dto: CreateApiKeyDto): Promise<CreateApiKeyResponse> {
        // Check current count
        const { data: existing } = await this.supabaseService
            .getAdminClient()
            .from('user_api_keys')
            .select('id')
            .eq('user_id', userId);

        if ((existing?.length || 0) >= MAX_API_KEYS) {
            throw new ForbiddenException({
                error: true,
                code: 'KEY_LIMIT_REACHED',
                message: `Batas maksimal API key tercapai (${MAX_API_KEYS})`,
            });
        }

        if (!dto.name || dto.name.trim().length === 0) {
            throw new BadRequestException({
                error: true,
                code: 'NAME_REQUIRED',
                message: 'Nama API key wajib diisi',
            });
        }

        // Generate key
        const rawKey = `sk-prod-${uuidv4().replace(/-/g, '')}`;
        const prefix = `sk-prod-...${rawKey.slice(-6)}`;
        const keyHash = await bcrypt.hash(rawKey, 10);

        // Store in database
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('user_api_keys')
            .insert({
                user_id: userId,
                name: dto.name.trim(),
                key_hash: keyHash,
                prefix,
            })
            .select('id')
            .single();

        if (error) {
            this.logger.error(`Failed to create API key: ${error.message}`);
            throw error;
        }

        this.logger.log(`Created API key ${data.id} for user ${userId}`);

        return {
            id: data.id,
            name: dto.name.trim(),
            key: rawKey,
            prefix,
            message: '⚠️ Simpan key ini sekarang! Tidak akan ditampilkan lagi.',
        };
    }

    /**
     * Delete an API key
     */
    async deleteApiKey(userId: string, keyId: string): Promise<{ success: boolean; message: string }> {
        // Check ownership
        const { data: key } = await this.supabaseService
            .getAdminClient()
            .from('user_api_keys')
            .select('id, user_id')
            .eq('id', keyId)
            .single();

        if (!key) {
            throw new NotFoundException({
                error: true,
                code: 'KEY_NOT_FOUND',
                message: 'API key tidak ditemukan',
            });
        }

        if (key.user_id !== userId) {
            throw new ForbiddenException({
                error: true,
                code: 'FORBIDDEN',
                message: 'Bukan pemilik API key',
            });
        }

        const { error } = await this.supabaseService
            .getAdminClient()
            .from('user_api_keys')
            .delete()
            .eq('id', keyId);

        if (error) throw error;

        this.logger.log(`Deleted API key ${keyId} for user ${userId}`);
        return {
            success: true,
            message: 'API key berhasil dihapus',
        };
    }

    /**
     * Get API usage statistics for user
     */
    async getApiUsage(userId: string, period: 'daily' | 'monthly'): Promise<ApiUsageResponse> {
        const now = new Date();
        let startDate: Date;
        let dateString: string;

        if (period === 'monthly') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            dateString = now.toISOString().split('T')[0];
        }

        try {
            // Get usage from generated_media table
            const { data: mediaData } = await this.supabaseService
                .getAdminClient()
                .from('generated_media')
                .select('media_type')
                .eq('user_id', userId)
                .gte('created_at', startDate.toISOString());

            // Count by type
            const usage = {
                chat: 0,  // TODO: Implement chat usage tracking
                image: 0,
                video: 0,
                music: 0,
                tts: 0,
            };

            for (const item of mediaData || []) {
                const type = item.media_type as keyof typeof usage;
                if (type in usage) {
                    usage[type]++;
                }
            }

            // Calculate percentages
            const percentUsed = {
                chat: Math.round((usage.chat / DEFAULT_LIMITS.chat) * 100),
                image: Math.round((usage.image / DEFAULT_LIMITS.image) * 100),
                video: Math.round((usage.video / DEFAULT_LIMITS.video) * 100),
                music: Math.round((usage.music / DEFAULT_LIMITS.music) * 100),
                tts: Math.round((usage.tts / DEFAULT_LIMITS.tts) * 100),
            };

            return {
                period,
                date: dateString,
                usage,
                limits: DEFAULT_LIMITS,
                percentUsed,
            };
        } catch (error) {
            this.logger.error(`Failed to get API usage: ${error.message}`);
            return {
                period,
                date: dateString,
                usage: { chat: 0, image: 0, video: 0, music: 0, tts: 0 },
                limits: DEFAULT_LIMITS,
                percentUsed: { chat: 0, image: 0, video: 0, music: 0, tts: 0 },
            };
        }
    }

    /**
     * Validate API key and return user ID if valid
     */
    async validateApiKey(apiKey: string): Promise<string | null> {
        if (!apiKey.startsWith('sk-prod-')) {
            return null;
        }

        // Get all keys and check against hash
        const { data: keys } = await this.supabaseService
            .getAdminClient()
            .from('user_api_keys')
            .select('id, user_id, key_hash');

        for (const key of keys || []) {
            const isValid = await bcrypt.compare(apiKey, key.key_hash);
            if (isValid) {
                // Update last used
                await this.supabaseService
                    .getAdminClient()
                    .from('user_api_keys')
                    .update({
                        last_used_at: new Date().toISOString(),
                        usage_count: (key as any).usage_count + 1,
                    })
                    .eq('id', key.id);

                return key.user_id;
            }
        }

        return null;
    }
}
