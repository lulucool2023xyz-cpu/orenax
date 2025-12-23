import { Injectable, Logger, NotFoundException, GoneException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { v4 as uuidv4 } from 'uuid';
import {
    CreateShareDto,
    CreateShareResponse,
    SharedChatResponse,
} from './dto/share.dto';

/**
 * Share Service
 * Handles chat sharing functionality
 */
@Injectable()
export class ShareService {
    private readonly logger = new Logger(ShareService.name);
    private readonly frontendUrl: string;

    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly configService: ConfigService,
    ) {
        this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://orenax.ai';
    }

    /**
     * Create a shareable link for a conversation
     */
    async createShare(userId: string, dto: CreateShareDto): Promise<CreateShareResponse> {
        // Generate short share ID
        const shareId = `sh_${uuidv4().slice(0, 12)}`;

        // Calculate expiry
        let expiresAt: Date | null = null;
        if (dto.expiresIn) {
            expiresAt = new Date(Date.now() + dto.expiresIn * 60 * 60 * 1000);
        }

        try {
            // Store share link in database
            const { error } = await this.supabaseService
                .getAdminClient()
                .from('shared_chats')
                .insert({
                    id: shareId,
                    conversation_id: dto.conversationId,
                    user_id: userId,
                    expires_at: expiresAt?.toISOString() || null,
                });

            if (error) throw error;

            this.logger.log(`Created share ${shareId} for conversation ${dto.conversationId}`);

            return {
                shareId,
                shareUrl: `${this.frontendUrl}/shared/${shareId}`,
                expiresAt: expiresAt?.toISOString() || null,
                isPublic: true,
            };
        } catch (error) {
            this.logger.error(`Failed to create share: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get shared chat by ID (PUBLIC - no auth required)
     */
    async getSharedChat(shareId: string): Promise<SharedChatResponse> {
        try {
            // Get share record
            const { data: share, error: shareError } = await this.supabaseService
                .getAdminClient()
                .from('shared_chats')
                .select('*, user:user_id(id, raw_user_meta_data)')
                .eq('id', shareId)
                .single();

            if (shareError || !share) {
                throw new NotFoundException({
                    error: true,
                    code: 'SHARE_NOT_FOUND',
                    message: 'Link tidak ditemukan',
                });
            }

            // Check if expired
            if (share.expires_at && new Date(share.expires_at) < new Date()) {
                throw new GoneException({
                    error: true,
                    code: 'SHARE_EXPIRED',
                    message: 'Link sudah kadaluarsa',
                });
            }

            // Get conversation messages
            // Note: This assumes there's a conversations table with messages
            // If conversations are stored differently, adjust this query
            const { data: conversationData } = await this.supabaseService
                .getAdminClient()
                .from('conversations')
                .select('title, messages')
                .eq('id', share.conversation_id)
                .single();

            // Parse messages from the conversation
            const messages = conversationData?.messages || [];
            const parsedMessages = Array.isArray(messages)
                ? messages.map((msg: any) => ({
                    role: msg.role as 'user' | 'model',
                    content: msg.content || msg.text || '',
                    timestamp: msg.timestamp || msg.createdAt || new Date().toISOString(),
                }))
                : [];

            // Get author info
            const authorMeta = (share as any).user?.raw_user_meta_data || {};

            return {
                id: shareId,
                title: conversationData?.title || 'Shared Conversation',
                messages: parsedMessages,
                messageCount: parsedMessages.length,
                createdAt: share.created_at,
                author: {
                    name: authorMeta.name || authorMeta.full_name || 'Anonymous',
                    avatar: authorMeta.avatar_url || null,
                },
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof GoneException) {
                throw error;
            }
            this.logger.error(`Failed to get shared chat: ${error.message}`);
            throw new NotFoundException({
                error: true,
                code: 'SHARE_NOT_FOUND',
                message: 'Link tidak ditemukan',
            });
        }
    }

    /**
     * Delete/revoke a share link
     */
    async deleteShare(userId: string, shareId: string): Promise<{ success: boolean; message: string }> {
        try {
            // Check ownership
            const { data: share } = await this.supabaseService
                .getAdminClient()
                .from('shared_chats')
                .select('id, user_id')
                .eq('id', shareId)
                .single();

            if (!share) {
                throw new NotFoundException({
                    error: true,
                    code: 'SHARE_NOT_FOUND',
                    message: 'Link tidak ditemukan',
                });
            }

            if (share.user_id !== userId) {
                throw new ForbiddenException({
                    error: true,
                    code: 'FORBIDDEN',
                    message: 'Bukan pemilik link',
                });
            }

            // Delete the share
            const { error } = await this.supabaseService
                .getAdminClient()
                .from('shared_chats')
                .delete()
                .eq('id', shareId);

            if (error) throw error;

            this.logger.log(`Deleted share ${shareId} for user ${userId}`);
            return {
                success: true,
                message: 'Link share berhasil dihapus',
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            this.logger.error(`Failed to delete share: ${error.message}`);
            throw error;
        }
    }
}
