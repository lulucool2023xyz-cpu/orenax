import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupabaseService } from '../../supabase/supabase.service';
import { MediaStorageService } from '../../supabase/media-storage.service';

/**
 * Context Prompt result
 */
export interface ContextPrompt {
    id: string;
    summary: string;
    sourceConversationId?: string;
    messageCount: number;
    createdAt: string;
}

/**
 * Conversation message for context
 */
interface ConversationMessage {
    role: 'user' | 'model';
    content: string;
}

/**
 * Context Prompt Service
 * Manages AI-generated conversation summaries for context memory
 * 
 * Flow:
 * 1. After conversation ends, call generateSummary()
 * 2. AI kedua summarizes the conversation into 1 paragraph
 * 3. Summary saved to context_prompts table
 * 4. On next conversation, inject active summaries into system prompt
 */
@Injectable()
export class ContextPromptService {
    private readonly logger = new Logger(ContextPromptService.name);
    private genAI: GoogleGenerativeAI | null = null;
    private readonly summaryModel = 'gemini-2.5-flash';

    constructor(
        private readonly configService: ConfigService,
        private readonly supabase: SupabaseService,
        private readonly mediaStorage: MediaStorageService,
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.logger.log('ContextPromptService initialized');
        }
    }

    /**
     * Generate a summary of the conversation using AI
     * This is called after a conversation ends or reaches a threshold
     */
    async generateSummary(
        userId: string,
        conversationId: string,
        messages: ConversationMessage[],
    ): Promise<ContextPrompt | null> {
        if (!this.genAI || messages.length < 2) {
            return null;
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: this.summaryModel });

            // Format messages for summarization
            const conversationText = messages
                .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
                .join('\n');

            const prompt = `Summarize the following conversation in 1-2 paragraphs. Focus on:
- The user's main intent/goal
- Key topics discussed
- Any preferences or context the AI should remember
- The outcome or resolution

Keep it concise but comprehensive. Write in third person (e.g., "The user asked about...").

Conversation:
${conversationText}

Summary:`;

            const result = await model.generateContent(prompt);
            const summary = result.response.text();

            if (!summary) {
                this.logger.warn('AI returned empty summary');
                return null;
            }

            // Save to database
            const saved = await this.saveContextPrompt(
                userId,
                summary,
                conversationId,
                messages.length,
            );

            this.logger.log(`Generated context summary for user ${userId}`);
            return saved;
        } catch (error) {
            this.logger.error('Failed to generate summary:', error);
            return null;
        }
    }

    /**
     * Save context prompt to database
     */
    private async saveContextPrompt(
        userId: string,
        summary: string,
        conversationId?: string,
        messageCount = 0,
    ): Promise<ContextPrompt> {
        const { data, error } = await this.supabase
            .getAdminClient()
            .from('context_prompts')
            .insert({
                user_id: userId,
                summary,
                source_conversation_id: conversationId,
                source_message_count: messageCount,
                model_used: this.summaryModel,
                is_active: true,
            })
            .select('id, summary, source_conversation_id, source_message_count, created_at')
            .single();

        if (error) throw error;

        return {
            id: data.id,
            summary: data.summary,
            sourceConversationId: data.source_conversation_id,
            messageCount: data.source_message_count,
            createdAt: data.created_at,
        };
    }

    /**
     * Get active context prompts for a user
     * Used to inject into system prompt for new conversations
     */
    async getActiveContexts(userId: string, limit = 5): Promise<ContextPrompt[]> {
        try {
            const { data, error } = await this.supabase
                .getAdminClient()
                .from('context_prompts')
                .select('id, summary, source_conversation_id, source_message_count, created_at')
                .eq('user_id', userId)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return (data || []).map(item => ({
                id: item.id,
                summary: item.summary,
                sourceConversationId: item.source_conversation_id,
                messageCount: item.source_message_count,
                createdAt: item.created_at,
            }));
        } catch (error) {
            this.logger.error('Failed to get active contexts:', error);
            return [];
        }
    }

    /**
     * Build system prompt with context memory
     * Combines base system prompt with user's conversation history summaries
     */
    async buildContextualSystemPrompt(
        userId: string,
        baseSystemPrompt?: string,
    ): Promise<string> {
        const contexts = await this.getActiveContexts(userId);

        if (contexts.length === 0) {
            return baseSystemPrompt || '';
        }

        // Get recent media history for additional context
        const recentMedia = await this.mediaStorage.getMediaForContext(userId, 10);

        let enhancedPrompt = baseSystemPrompt || 'You are a helpful AI assistant.';

        enhancedPrompt += '\n\n## User Context (Previous Conversations)\n';
        enhancedPrompt += 'Here is a summary of previous interactions with this user:\n\n';

        contexts.forEach((ctx, idx) => {
            enhancedPrompt += `${idx + 1}. ${ctx.summary}\n\n`;
        });

        if (recentMedia.length > 0) {
            enhancedPrompt += '## Recent Generations\n';
            enhancedPrompt += 'The user has recently generated:\n';
            recentMedia.forEach(m => {
                enhancedPrompt += `- ${m.mediaType}: "${m.prompt.substring(0, 100)}..." (${m.model})\n`;
            });
        }

        enhancedPrompt += '\nUse this context to provide personalized and contextually relevant responses.';

        return enhancedPrompt;
    }

    /**
     * Deactivate a context prompt
     */
    async deactivateContext(contextId: string, userId: string): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .getAdminClient()
                .from('context_prompts')
                .update({ is_active: false })
                .eq('id', contextId)
                .eq('user_id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            this.logger.error('Failed to deactivate context:', error);
            return false;
        }
    }

    /**
     * Get all context prompts for a user (including inactive)
     */
    async getAllContexts(userId: string): Promise<ContextPrompt[]> {
        try {
            const { data, error } = await this.supabase
                .getAdminClient()
                .from('context_prompts')
                .select('id, summary, source_conversation_id, source_message_count, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(item => ({
                id: item.id,
                summary: item.summary,
                sourceConversationId: item.source_conversation_id,
                messageCount: item.source_message_count,
                createdAt: item.created_at,
            }));
        } catch (error) {
            this.logger.error('Failed to get all contexts:', error);
            return [];
        }
    }

    /**
     * Get history for internal AI context (not user-facing)
     * Combines conversation messages + generated media history
     */
    async getInternalContextHistory(userId: string): Promise<{
        conversations: { summary: string; createdAt: string }[];
        mediaHistory: { type: string; prompt: string; model: string; createdAt: string }[];
    }> {
        const contexts = await this.getActiveContexts(userId, 10);
        const media = await this.mediaStorage.getMediaForContext(userId, 20);

        return {
            conversations: contexts.map(c => ({
                summary: c.summary,
                createdAt: c.createdAt,
            })),
            mediaHistory: media.map(m => ({
                type: m.mediaType,
                prompt: m.prompt,
                model: m.model,
                createdAt: m.createdAt,
            })),
        };
    }

    /**
     * Auto-summarize conversation after reaching threshold
     * Call this after each model response
     */
    async checkAndSummarize(
        userId: string,
        conversationId: string,
        currentMessageCount: number,
        messages: ConversationMessage[],
        threshold = 10,
    ): Promise<void> {
        // Only summarize after threshold messages
        if (currentMessageCount < threshold || currentMessageCount % threshold !== 0) {
            return;
        }

        // Get recent messages for summary
        const recentMessages = messages.slice(-threshold);
        await this.generateSummary(userId, conversationId, recentMessages);
    }
}
