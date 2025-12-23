import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
    CreatePromptDto,
    UpdatePromptDto,
    PromptsQueryDto,
    PromptsListResponse,
    PromptItem,
    UsePromptResponse,
} from './dto/prompts.dto';

const CATEGORIES = ['writing', 'coding', 'marketing', 'education', 'creative', 'business'];

/**
 * Prompts Service
 * Handles prompt marketplace operations
 */
@Injectable()
export class PromptsService {
    private readonly logger = new Logger(PromptsService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    /**
     * Get public prompts marketplace
     */
    async getMarketplace(userId: string | null, query: PromptsQueryDto): Promise<PromptsListResponse> {
        return this.getPrompts(userId, query, true);
    }

    /**
     * Get user's own prompts
     */
    async getMyPrompts(userId: string, query: PromptsQueryDto): Promise<PromptsListResponse> {
        return this.getPrompts(userId, query, false, userId);
    }

    /**
     * Internal method to get prompts with filters
     */
    private async getPrompts(
        currentUserId: string | null,
        query: PromptsQueryDto,
        publicOnly: boolean,
        ownerId?: string,
    ): Promise<PromptsListResponse> {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 20, 50);
        const offset = (page - 1) * limit;

        try {
            // Build base query
            let dbQuery = this.supabaseService.getAdminClient()
                .from('prompts')
                .select('*, user:user_id(id, raw_user_meta_data)', { count: 'exact' });

            // Apply filters
            if (publicOnly) {
                dbQuery = dbQuery.eq('is_public', true);
            }
            if (ownerId) {
                dbQuery = dbQuery.eq('user_id', ownerId);
            }
            if (query.category) {
                dbQuery = dbQuery.eq('category', query.category);
            }
            if (query.search) {
                dbQuery = dbQuery.or(`title.ilike.%${query.search}%,description.ilike.%${query.search}%`);
            }

            // Apply sorting
            switch (query.sort) {
                case 'recent':
                    dbQuery = dbQuery.order('created_at', { ascending: false });
                    break;
                case 'rating':
                    dbQuery = dbQuery.order('rating_sum', { ascending: false });
                    break;
                case 'popular':
                default:
                    dbQuery = dbQuery.order('uses_count', { ascending: false });
                    break;
            }

            // Apply pagination
            dbQuery = dbQuery.range(offset, offset + limit - 1);

            const { data, count, error } = await dbQuery;
            if (error) throw error;

            // Get user's saved prompts if authenticated
            let savedPromptIds: Set<string> = new Set();
            if (currentUserId) {
                const { data: saves } = await this.supabaseService.getAdminClient()
                    .from('prompt_saves')
                    .select('prompt_id')
                    .eq('user_id', currentUserId);
                savedPromptIds = new Set((saves || []).map(s => s.prompt_id));
            }

            const prompts: PromptItem[] = (data || []).map(item => this.mapToPromptItem(item, savedPromptIds));
            const total = count || 0;

            return {
                prompts,
                total,
                page,
                hasMore: offset + prompts.length < total,
                categories: CATEGORIES,
            };
        } catch (error) {
            this.logger.error(`Failed to get prompts: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create a new prompt
     */
    async createPrompt(userId: string, dto: CreatePromptDto): Promise<{ id: string; title: string; message: string }> {
        try {
            const { data, error } = await this.supabaseService.getAdminClient()
                .from('prompts')
                .insert({
                    user_id: userId,
                    title: dto.title,
                    description: dto.description || null,
                    prompt: dto.prompt,
                    category: dto.category || null,
                    is_public: dto.isPublic || false,
                })
                .select('id, title')
                .single();

            if (error) throw error;

            this.logger.log(`Created prompt ${data.id} for user ${userId}`);
            return {
                id: data.id,
                title: data.title,
                message: 'Prompt berhasil dibuat',
            };
        } catch (error) {
            this.logger.error(`Failed to create prompt: ${error.message}`);
            throw error;
        }
    }

    /**
     * Update an existing prompt
     */
    async updatePrompt(userId: string, promptId: string, dto: UpdatePromptDto): Promise<{ success: boolean; message: string }> {
        // Check ownership
        await this.verifyOwnership(userId, promptId);

        const updateData: any = { updated_at: new Date().toISOString() };
        if (dto.title !== undefined) updateData.title = dto.title;
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.prompt !== undefined) updateData.prompt = dto.prompt;
        if (dto.category !== undefined) updateData.category = dto.category;
        if (dto.isPublic !== undefined) updateData.is_public = dto.isPublic;

        const { error } = await this.supabaseService.getAdminClient()
            .from('prompts')
            .update(updateData)
            .eq('id', promptId);

        if (error) throw error;

        this.logger.log(`Updated prompt ${promptId} for user ${userId}`);
        return {
            success: true,
            message: 'Prompt berhasil diupdate',
        };
    }

    /**
     * Delete a prompt
     */
    async deletePrompt(userId: string, promptId: string): Promise<{ success: boolean; message: string }> {
        await this.verifyOwnership(userId, promptId);

        const { error } = await this.supabaseService.getAdminClient()
            .from('prompts')
            .delete()
            .eq('id', promptId);

        if (error) throw error;

        this.logger.log(`Deleted prompt ${promptId} for user ${userId}`);
        return {
            success: true,
            message: 'Prompt berhasil dihapus',
        };
    }

    /**
     * Save/bookmark a prompt
     */
    async savePrompt(userId: string, promptId: string): Promise<{ success: boolean; isSaved: boolean }> {
        try {
            // Check if already saved
            const { data: existing } = await this.supabaseService.getAdminClient()
                .from('prompt_saves')
                .select('user_id')
                .eq('user_id', userId)
                .eq('prompt_id', promptId)
                .single();

            if (existing) {
                // Unsave
                await this.supabaseService.getAdminClient()
                    .from('prompt_saves')
                    .delete()
                    .eq('user_id', userId)
                    .eq('prompt_id', promptId);

                return { success: true, isSaved: false };
            } else {
                // Save
                await this.supabaseService.getAdminClient()
                    .from('prompt_saves')
                    .insert({ user_id: userId, prompt_id: promptId });

                return { success: true, isSaved: true };
            }
        } catch (error) {
            this.logger.error(`Failed to save/unsave prompt: ${error.message}`);
            throw error;
        }
    }

    /**
     * Use a prompt - record usage and return content
     */
    async usePrompt(promptId: string): Promise<UsePromptResponse> {
        try {
            // Get prompt
            const { data: prompt, error } = await this.supabaseService.getAdminClient()
                .from('prompts')
                .select('prompt, uses_count')
                .eq('id', promptId)
                .single();

            if (error || !prompt) {
                throw new NotFoundException({
                    error: true,
                    code: 'PROMPT_NOT_FOUND',
                    message: 'Prompt tidak ditemukan',
                });
            }

            // Increment usage count
            await this.supabaseService.getAdminClient()
                .from('prompts')
                .update({ uses_count: (prompt.uses_count || 0) + 1 })
                .eq('id', promptId);

            // Extract variables from prompt (e.g., {topic}, {keywords})
            const variableRegex = /\{(\w+)\}/g;
            const variables: string[] = [];
            let match;
            while ((match = variableRegex.exec(prompt.prompt)) !== null) {
                if (!variables.includes(match[1])) {
                    variables.push(match[1]);
                }
            }

            return {
                success: true,
                prompt: prompt.prompt,
                variables,
            };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`Failed to use prompt: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verify user owns the prompt
     */
    private async verifyOwnership(userId: string, promptId: string): Promise<void> {
        const { data: prompt } = await this.supabaseService.getAdminClient()
            .from('prompts')
            .select('id, user_id')
            .eq('id', promptId)
            .single();

        if (!prompt) {
            throw new NotFoundException({
                error: true,
                code: 'PROMPT_NOT_FOUND',
                message: 'Prompt tidak ditemukan',
            });
        }

        if (prompt.user_id !== userId) {
            throw new ForbiddenException({
                error: true,
                code: 'FORBIDDEN',
                message: 'Bukan pemilik prompt',
            });
        }
    }

    /**
     * Map database record to PromptItem
     */
    private mapToPromptItem(item: any, savedPromptIds: Set<string>): PromptItem {
        const userMeta = (item as any).user?.raw_user_meta_data || {};
        const rating = item.rating_count > 0
            ? Math.round((item.rating_sum / item.rating_count) * 10) / 10
            : 0;

        return {
            id: item.id,
            title: item.title,
            description: item.description,
            prompt: item.prompt,
            category: item.category,
            author: {
                id: item.user_id,
                name: userMeta.name || userMeta.full_name || 'Anonymous',
                avatar: userMeta.avatar_url || null,
            },
            uses: item.uses_count || 0,
            rating,
            ratingCount: item.rating_count || 0,
            isPublic: item.is_public,
            isSaved: savedPromptIds.has(item.id),
            createdAt: item.created_at,
        };
    }
}
