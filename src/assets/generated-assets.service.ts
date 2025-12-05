import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

/**
 * Asset types
 */
export type AssetType = 'image' | 'video' | 'music' | 'audio' | 'tts';

/**
 * Create asset DTO
 */
export interface CreateAssetDto {
    assetType: AssetType;
    url: string;
    filename: string;
    prompt?: string;
    model?: string;
    metadata?: Record<string, any>;
}

/**
 * Asset entity
 */
export interface Asset {
    id: string;
    userId: string;
    assetType: AssetType;
    url: string;
    filename: string;
    prompt?: string;
    model?: string;
    metadata?: Record<string, any>;
    createdAt: string;
}

/**
 * Generated Assets Service
 * Tracks all user-generated assets (images, videos, music, audio) with their GCS URLs
 */
@Injectable()
export class GeneratedAssetsService {
    private readonly logger = new Logger(GeneratedAssetsService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    /**
     * Save a generated asset to the database
     */
    async saveAsset(userId: string, dto: CreateAssetDto): Promise<Asset> {
        try {
            const supabase = this.supabaseService.getAdminClient();

            const { data, error } = await supabase
                .from('generated_assets')
                .insert({
                    user_id: userId,
                    asset_type: dto.assetType,
                    url: dto.url,
                    filename: dto.filename,
                    prompt: dto.prompt,
                    model: dto.model,
                    metadata: dto.metadata || {},
                })
                .select()
                .single();

            if (error) {
                this.logger.error(`Failed to save asset: ${error.message}`);
                throw new HttpException(
                    'Failed to save asset to database',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            this.logger.log(`Asset saved: ${data.id} for user ${userId}`);

            return this.mapToAsset(data);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error('Error saving asset:', error);
            throw new HttpException(
                'Failed to save asset',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Get all assets for a user
     */
    async getUserAssets(
        userId: string,
        type?: AssetType,
        limit: number = 50,
        offset: number = 0,
    ): Promise<{ assets: Asset[]; total: number }> {
        try {
            const supabase = this.supabaseService.getClient();

            let query = supabase
                .from('generated_assets')
                .select('*', { count: 'exact' })
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (type) {
                query = query.eq('asset_type', type);
            }

            const { data, error, count } = await query;

            if (error) {
                this.logger.error(`Failed to get assets: ${error.message}`);
                throw new HttpException(
                    'Failed to retrieve assets',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            return {
                assets: (data || []).map(this.mapToAsset),
                total: count || 0,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error('Error getting assets:', error);
            throw new HttpException(
                'Failed to retrieve assets',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Get a single asset by ID
     */
    async getAssetById(id: string, userId: string): Promise<Asset | null> {
        try {
            const supabase = this.supabaseService.getClient();

            const { data, error } = await supabase
                .from('generated_assets')
                .select('*')
                .eq('id', id)
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // Not found
                }
                this.logger.error(`Failed to get asset: ${error.message}`);
                throw new HttpException(
                    'Failed to retrieve asset',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            return this.mapToAsset(data);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error('Error getting asset:', error);
            throw new HttpException(
                'Failed to retrieve asset',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Delete an asset
     */
    async deleteAsset(id: string, userId: string): Promise<void> {
        try {
            const supabase = this.supabaseService.getClient();

            const { error } = await supabase
                .from('generated_assets')
                .delete()
                .eq('id', id)
                .eq('user_id', userId);

            if (error) {
                this.logger.error(`Failed to delete asset: ${error.message}`);
                throw new HttpException(
                    'Failed to delete asset',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            this.logger.log(`Asset deleted: ${id}`);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error('Error deleting asset:', error);
            throw new HttpException(
                'Failed to delete asset',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Get assets count by type for a user
     */
    async getAssetsCounts(userId: string): Promise<Record<AssetType, number>> {
        try {
            const supabase = this.supabaseService.getClient();

            const types: AssetType[] = ['image', 'video', 'music', 'audio', 'tts'];
            const counts: Record<string, number> = {};

            for (const type of types) {
                const { count, error } = await supabase
                    .from('generated_assets')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .eq('asset_type', type);

                if (error) {
                    this.logger.error(`Failed to count ${type} assets: ${error.message}`);
                    counts[type] = 0;
                } else {
                    counts[type] = count || 0;
                }
            }

            return counts as Record<AssetType, number>;
        } catch (error) {
            this.logger.error('Error counting assets:', error);
            return {
                image: 0,
                video: 0,
                music: 0,
                audio: 0,
                tts: 0,
            };
        }
    }

    /**
     * Map database row to Asset entity
     */
    private mapToAsset(row: any): Asset {
        return {
            id: row.id,
            userId: row.user_id,
            assetType: row.asset_type,
            url: row.url,
            filename: row.filename,
            prompt: row.prompt,
            model: row.model,
            metadata: row.metadata,
            createdAt: row.created_at,
        };
    }
}
