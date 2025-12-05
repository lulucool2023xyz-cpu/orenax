import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

/**
 * Gemini Conversation Service
 * Handles conversation and message persistence for Gemini API v2
 */
@Injectable()
export class GeminiConversationService {
    private readonly logger = new Logger(GeminiConversationService.name);

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
            const { data, error } = await this.supabase
                .getAdminClient()
                .from('conversations')
                .insert({
                    user_id: userId,
                    model,
                    title: title || 'Gemini Chat',
                    api_version: 'v2',
                })
                .select('id')
                .single();

            if (error) throw error;

            this.logger.log(`Created v2 conversation: ${data.id}`);
            return data.id;
        } catch (error) {
            this.logger.error('Failed to create conversation:', error);
            throw new Error('Could not create conversation');
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
            // Don't throw - message saving is non-critical
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
     * List user conversations (v2 only)
     */
    async listConversations(userId: string): Promise<any[]> {
        try {
            const { data, error } = await this.supabase
                .getAdminClient()
                .from('conversations')
                .select('id, title, model, created_at, updated_at')
                .eq('user_id', userId)
                .eq('api_version', 'v2')
                .order('updated_at', { ascending: false });

            if (error) throw error;

            return data || [];
        } catch (error) {
            this.logger.error('Failed to list conversations:', error);
            throw error;
        }
    }

    /**
     * Update conversation timestamp
     */
    private async updateConversationTimestamp(conversationId: string): Promise<void> {
        await this.supabase
            .getAdminClient()
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);
    }
}
