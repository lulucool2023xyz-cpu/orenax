import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

/**
 * Media types that can be stored
 */
export type MediaType = 'image' | 'video' | 'music' | 'audio';

/**
 * Parameters for saving generated media to Supabase
 */
export interface SaveMediaParams {
    userId: string;
    mediaType: MediaType;
    url: string;              // Required: GCS public URL (https://...)
    gcsUri?: string;          // Optional: GCS URI (gs://...)
    filename?: string;
    mimeType?: string;
    fileSize?: number;
    model: string;
    prompt: string;
    negativePrompt?: string;
    apiVersion: 'v1' | 'v2';
    endpoint?: string;        // e.g., 'text-to-image', 'gemini-generate'
    metadata?: Record<string, any>;
}

/**
 * Result of saving media
 */
export interface SaveMediaResult {
    id: string;
    url: string;
    savedAt: string;
}

/**
 * Media Storage Service
 * Handles saving generated media (images, videos, music, audio) to Supabase
 * Only saves if a valid GCS URL is provided
 */
@Injectable()
export class MediaStorageService {
    private readonly logger = new Logger(MediaStorageService.name);

    constructor(private readonly supabase: SupabaseService) { }

    /**
     * Save generated media to Supabase
     * Validates URL before saving - rejects if no valid GCS URL
     */
    async saveMedia(params: SaveMediaParams): Promise<SaveMediaResult | null> {
        // Validate URL - must be HTTPS (GCS public URL)
        if (!params.url || !params.url.startsWith('https://')) {
            this.logger.warn(`Skipping save - no valid URL for ${params.mediaType}`);
            return null;
        }

        try {
            const { data, error } = await this.supabase
                .getAdminClient()
                .from('generated_media')
                .insert({
                    user_id: params.userId,
                    media_type: params.mediaType,
                    url: params.url,
                    gcs_uri: params.gcsUri,
                    filename: params.filename,
                    mime_type: params.mimeType,
                    file_size: params.fileSize,
                    model: params.model,
                    prompt: params.prompt,
                    negative_prompt: params.negativePrompt,
                    api_version: params.apiVersion,
                    endpoint: params.endpoint,
                    metadata: params.metadata || {},
                })
                .select('id, url, created_at')
                .single();

            if (error) throw error;

            this.logger.log(`Saved ${params.mediaType} to database: ${data.id}`);
            return {
                id: data.id,
                url: data.url,
                savedAt: data.created_at,
            };
        } catch (error) {
            this.logger.error(`Failed to save media: ${error.message}`);
            // Don't throw - saving is non-critical, don't break the main flow
            return null;
        }
    }

    /**
     * Get user's generated media by type
     */
    async getUserMedia(
        userId: string,
        mediaType?: MediaType,
        limit = 50,
        offset = 0,
    ): Promise<any[]> {
        try {
            let query = this.supabase
                .getAdminClient()
                .from('generated_media')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (mediaType) {
                query = query.eq('media_type', mediaType);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            this.logger.error(`Failed to get user media: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get single media by ID (with ownership check)
     */
    async getMediaById(mediaId: string, userId: string): Promise<any | null> {
        try {
            const { data, error } = await this.supabase
                .getAdminClient()
                .from('generated_media')
                .select('*')
                .eq('id', mediaId)
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // Not found
                throw error;
            }
            return data;
        } catch (error) {
            this.logger.error(`Failed to get media by ID: ${error.message}`);
            throw error;
        }
    }

    /**
     * Delete media by ID (with ownership check)
     */
    async deleteMedia(mediaId: string, userId: string): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .getAdminClient()
                .from('generated_media')
                .delete()
                .eq('id', mediaId)
                .eq('user_id', userId);

            if (error) throw error;

            this.logger.log(`Deleted media: ${mediaId}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to delete media: ${error.message}`);
            return false;
        }
    }

    /**
     * Get user's media stats
     */
    async getUserMediaStats(userId: string): Promise<{
        totalImages: number;
        totalVideos: number;
        totalMusic: number;
        totalAudio: number;
    }> {
        try {
            const { data, error } = await this.supabase
                .getAdminClient()
                .from('generated_media')
                .select('media_type')
                .eq('user_id', userId);

            if (error) throw error;

            const stats = {
                totalImages: 0,
                totalVideos: 0,
                totalMusic: 0,
                totalAudio: 0,
            };

            for (const item of data || []) {
                switch (item.media_type) {
                    case 'image': stats.totalImages++; break;
                    case 'video': stats.totalVideos++; break;
                    case 'music': stats.totalMusic++; break;
                    case 'audio': stats.totalAudio++; break;
                }
            }

            return stats;
        } catch (error) {
            this.logger.error(`Failed to get media stats: ${error.message}`);
            return { totalImages: 0, totalVideos: 0, totalMusic: 0, totalAudio: 0 };
        }
    }

    /**
     * Internal: Get all media for context prompt generation
     * Used by AI to understand user's generation history
     */
    async getMediaForContext(userId: string, limit = 20): Promise<{
        mediaType: string;
        prompt: string;
        model: string;
        createdAt: string;
    }[]> {
        try {
            const { data, error } = await this.supabase
                .getAdminClient()
                .from('generated_media')
                .select('media_type, prompt, model, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return (data || []).map(item => ({
                mediaType: item.media_type,
                prompt: item.prompt,
                model: item.model,
                createdAt: item.created_at,
            }));
        } catch (error) {
            this.logger.error(`Failed to get media for context: ${error.message}`);
            return [];
        }
    }
}
