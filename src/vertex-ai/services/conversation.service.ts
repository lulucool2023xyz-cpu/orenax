import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Content } from '../types/vertex-ai.types';

/**
 * Conversation Service
 * Manages conversation storage in Supabase
 */
@Injectable()
export class ConversationService {
    private readonly logger = new Logger(ConversationService.name);

    constructor(private readonly supabase: SupabaseService) { }

    /**
     * Create a new conversation
     */
    async createConversation(
        userId: string,
        model: string,
        title?: string,
    ): Promise<string> {
        try {
            // Use admin client to bypass RLS since backend operations don't have user session
            const { data, error } = await this.supabase
                .getAdminClient()
                .from('conversations')
                .insert({
                    user_id: userId,
                    model,
                    title: title || 'New Conversation',
                })
                .select('id')
                .single();

            if (error) throw error;

            this.logger.log(`Created conversation: ${data.id}`);
            return data.id;
        } catch (error) {
            this.logger.error('Failed to create conversation:', error);
            throw new Error('Could not create conversation');
        }
    }

    /**
     * Get conversation history
     */
    async getConversationHistory(
        conversationId: string,
        userId: string,
    ): Promise<{ role: string; content: string }[]> {
        try {
            // Verify conversation belongs to user (use admin client)
            const { data: conversation, error: convError } = await this.supabase
                .getAdminClient()
                .from('conversations')
                .select('id')
                .eq('id', conversationId)
                .eq('user_id', userId)
                .single();

            if (convError || !conversation) {
                throw new Error('Conversation not found or unauthorized');
            }

            // Get messages (use admin client)
            const { data: messages, error: msgError } = await this.supabase
                .getAdminClient()
                .from('messages')
                .select('role, content')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (msgError) throw msgError;

            return messages || [];
        } catch (error) {
            this.logger.error('Failed to get conversation history:', error);
            throw error;
        }
    }

    /**
     * Add message to conversation
     */
    async addMessage(
        conversationId: string,
        role: 'user' | 'model',
        content: string,
        metadata?: any,
    ): Promise<void> {
        try {
            // Use admin client to bypass RLS
            const { error } = await this.supabase
                .getAdminClient()
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    role,
                    content,
                    metadata,
                });

            if (error) throw error;

            // Update conversation timestamp
            await this.updateConversationTimestamp(conversationId);
        } catch (error) {
            this.logger.error('Failed to add message:', error);
            throw new Error('Could not add message to conversation');
        }
    }

    /**
     * Update conversation timestamp
     */
    private async updateConversationTimestamp(conversationId: string): Promise<void> {
        // Use admin client to bypass RLS
        await this.supabase
            .getAdminClient()
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);
    }

    /**
     * List user conversations
     */
    async listConversations(userId: string): Promise<any[]> {
        try {
            // Use admin client to bypass RLS
            const { data, error } = await this.supabase
                .getAdminClient()
                .from('conversations')
                .select('id, title, model, created_at, updated_at')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (error) {
            this.logger.error('Failed to list conversations:', error);
            throw error;
        }
    }

    /**
     * Delete conversation
     */
    async deleteConversation(
        conversationId: string,
        userId: string,
    ): Promise<void> {
        try {
            // Use admin client to bypass RLS
            const { error } = await this.supabase
                .getAdminClient()
                .from('conversations')
                .delete()
                .eq('id', conversationId)
                .eq('user_id', userId);

            if (error) throw error;

            this.logger.log(`Deleted conversation: ${conversationId}`);
        } catch (error) {
            this.logger.error('Failed to delete conversation:', error);
            throw error;
        }
    }
}
