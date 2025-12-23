import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { MediaHistoryQueryDto, MediaHistoryResponse, MediaHistoryItem } from './dto/media-history.dto';

/**
 * Media Service
 * Handles media history/gallery operations
 */
@Injectable()
export class MediaService {
    private readonly logger = new Logger(MediaService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    /**
     * Get paginated media history for user
     */
    async getMediaHistory(userId: string, query: MediaHistoryQueryDto): Promise<MediaHistoryResponse> {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 20, 50);
        const offset = (page - 1) * limit;

        try {
            // Build query
            let dbQuery = this.supabaseService.getAdminClient()
                .from('generated_media')
                .select('*', { count: 'exact' })
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            // Apply type filter if specified
            if (query.type) {
                dbQuery = dbQuery.eq('media_type', query.type);
            }

            const { data, count, error } = await dbQuery;

            if (error) throw error;

            const total = count || 0;
            const items: MediaHistoryItem[] = (data || []).map(item => this.mapToHistoryItem(item));

            return {
                items,
                total,
                page,
                limit,
                hasMore: offset + items.length < total,
            };
        } catch (error) {
            this.logger.error(`Failed to get media history: ${error.message}`);
            throw error;
        }
    }

    /**
     * Delete media by ID
     */
    async deleteMedia(userId: string, mediaId: string): Promise<{ success: boolean; message: string }> {
        try {
            // First check if media exists and belongs to user
            const { data: media, error: fetchError } = await this.supabaseService
                .getAdminClient()
                .from('generated_media')
                .select('id, user_id')
                .eq('id', mediaId)
                .single();

            if (fetchError || !media) {
                throw new NotFoundException({
                    error: true,
                    code: 'MEDIA_NOT_FOUND',
                    message: 'Media tidak ditemukan',
                });
            }

            if (media.user_id !== userId) {
                throw new ForbiddenException({
                    error: true,
                    code: 'FORBIDDEN',
                    message: 'Bukan pemilik media',
                });
            }

            // Delete the media
            const { error: deleteError } = await this.supabaseService
                .getAdminClient()
                .from('generated_media')
                .delete()
                .eq('id', mediaId);

            if (deleteError) throw deleteError;

            this.logger.log(`Deleted media ${mediaId} for user ${userId}`);
            return {
                success: true,
                message: 'Media berhasil dihapus',
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            this.logger.error(`Failed to delete media: ${error.message}`);
            throw error;
        }
    }

    /**
     * Map database record to MediaHistoryItem
     */
    private mapToHistoryItem(item: any): MediaHistoryItem {
        const metadata = item.metadata || {};

        return {
            id: item.id,
            type: item.media_type,
            url: item.url,
            thumbnailUrl: item.thumbnail_url || null,
            prompt: item.prompt,
            model: item.model,
            createdAt: item.created_at,
            metadata: {
                width: metadata.width,
                height: metadata.height,
                format: item.mime_type?.split('/')[1] || metadata.format,
                size: item.file_size || metadata.size,
                duration: metadata.duration,
            },
        };
    }
}
