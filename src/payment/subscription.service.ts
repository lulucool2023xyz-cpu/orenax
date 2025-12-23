import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

/**
 * Plan features configuration
 */
const PLAN_FEATURES = {
    free: [
        '10_messages_daily',
        'basic_models',
        '3_images_daily',
        '0_videos_daily',
        'limited_voice',
    ],
    pro: [
        'unlimited_messages',
        'all_models',
        '50_images_daily',
        '10_videos_daily',
        'voice_unlimited',
        'deep_thinking',
        'priority_support',
    ],
    enterprise: [
        'unlimited_messages',
        'all_models',
        'unlimited_images',
        'unlimited_videos',
        'voice_unlimited',
        'deep_thinking',
        'priority_support',
        'custom_models',
        'api_access',
        'dedicated_support',
    ],
};

export interface SubscriptionStatus {
    isActive: boolean;
    plan: string;
    expiresAt: string | null;
    features: string[];
    daysRemaining: number | null;
}

/**
 * Subscription Service
 * Manages user subscription status and feature access
 */
@Injectable()
export class SubscriptionService {
    private readonly logger = new Logger(SubscriptionService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    /**
     * Get user's current subscription status
     */
    async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
        try {
            const { data: subscription } = await this.supabaseService
                .getAdminClient()
                .from('subscriptions')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'active')
                .single();

            if (!subscription || new Date(subscription.current_period_end) < new Date()) {
                // No active subscription or expired
                return {
                    isActive: false,
                    plan: 'free',
                    expiresAt: null,
                    features: PLAN_FEATURES.free,
                    daysRemaining: null,
                };
            }

            const expiresAt = new Date(subscription.current_period_end);
            const now = new Date();
            const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            return {
                isActive: true,
                plan: subscription.plan,
                expiresAt: subscription.current_period_end,
                features: PLAN_FEATURES[subscription.plan] || PLAN_FEATURES.free,
                daysRemaining,
            };
        } catch (error) {
            // No subscription found
            this.logger.debug(`No subscription found for user ${userId}`);
            return {
                isActive: false,
                plan: 'free',
                expiresAt: null,
                features: PLAN_FEATURES.free,
                daysRemaining: null,
            };
        }
    }

    /**
     * Check if user has feature access
     */
    async hasFeature(userId: string, feature: string): Promise<boolean> {
        const status = await this.getSubscriptionStatus(userId);
        return status.features.includes(feature);
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
        try {
            const { error } = await this.supabaseService
                .getAdminClient()
                .from('subscriptions')
                .update({ status: 'cancelled', updated_at: new Date().toISOString() })
                .eq('user_id', userId);

            if (error) throw error;

            this.logger.log(`Subscription cancelled for user ${userId}`);
            return {
                success: true,
                message: 'Subscription berhasil dibatalkan',
            };
        } catch (error) {
            this.logger.error(`Failed to cancel subscription: ${error.message}`);
            return {
                success: false,
                message: 'Gagal membatalkan subscription',
            };
        }
    }
}
