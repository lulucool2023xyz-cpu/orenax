import { Injectable, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateOrderDto, CreateOrderResponse } from './dto/create-order.dto';
import { VerifyPaymentDto, VerifyPaymentResponse } from './dto/verify-payment.dto';

/**
 * Payment Service
 * Handles Midtrans payment integration for subscriptions
 */
@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);
    private readonly serverKey: string;
    private readonly clientKey: string;
    private readonly isProduction: boolean;
    private readonly baseUrl: string;

    // Pricing in IDR
    private readonly PRICING = {
        pro: {
            monthly: 99000,
            yearly: 950400,
        },
        enterprise: {
            monthly: 499000,
            yearly: 4790400,
        },
    };

    constructor(
        private readonly configService: ConfigService,
        private readonly supabaseService: SupabaseService,
    ) {
        this.serverKey = this.configService.get<string>('MIDTRANS_SERVER_KEY') || '';
        this.clientKey = this.configService.get<string>('MIDTRANS_CLIENT_KEY') || '';
        this.isProduction = this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true';
        this.baseUrl = this.isProduction
            ? 'https://app.midtrans.com'
            : 'https://app.sandbox.midtrans.com';
    }

    /**
     * Create a new order for subscription payment
     */
    async createOrder(userId: string, dto: CreateOrderDto): Promise<CreateOrderResponse> {
        // Check if user already has active subscription
        const existingSubscription = await this.getActiveSubscription(userId);
        if (existingSubscription) {
            throw new ConflictException({
                error: true,
                code: 'ALREADY_SUBSCRIBED',
                message: 'User sudah memiliki subscription aktif',
            });
        }

        // Validate plan
        if (!this.PRICING[dto.planId]) {
            throw new BadRequestException({
                error: true,
                code: 'INVALID_PLAN',
                message: 'Plan ID tidak valid',
            });
        }

        const amount = this.PRICING[dto.planId][dto.billingCycle];
        const orderId = `ORD-${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

        // Get user details for Midtrans
        const { data: userData } = await this.supabaseService
            .getAdminClient()
            .auth.admin.getUserById(userId);

        // Create Snap token via Midtrans API
        const snapToken = await this.createSnapToken({
            orderId,
            amount,
            userId,
            userEmail: userData?.user?.email || '',
            userName: userData?.user?.user_metadata?.name || 'User',
            planId: dto.planId,
            billingCycle: dto.billingCycle,
        });

        // Store order in database for verification later
        await this.supabaseService.getAdminClient()
            .from('payment_orders')
            .insert({
                id: orderId,
                user_id: userId,
                plan_id: dto.planId,
                billing_cycle: dto.billingCycle,
                amount,
                status: 'pending',
                expires_at: expiresAt.toISOString(),
            });

        this.logger.log(`Created order ${orderId} for user ${userId}, plan: ${dto.planId}`);

        return {
            orderId,
            snapToken,
            amount,
            currency: 'IDR',
            expiresAt: expiresAt.toISOString(),
        };
    }

    /**
     * Verify payment after Midtrans callback
     */
    async verifyPayment(userId: string, dto: VerifyPaymentDto): Promise<VerifyPaymentResponse> {
        // Verify with Midtrans
        const transactionStatus = await this.checkTransactionStatus(dto.orderId);

        if (transactionStatus.transaction_status !== 'capture' &&
            transactionStatus.transaction_status !== 'settlement') {
            throw new BadRequestException({
                error: true,
                code: 'PAYMENT_NOT_COMPLETED',
                message: 'Pembayaran belum selesai',
            });
        }

        // Get order details
        const { data: order } = await this.supabaseService.getAdminClient()
            .from('payment_orders')
            .select('*')
            .eq('id', dto.orderId)
            .eq('user_id', userId)
            .single();

        if (!order) {
            throw new BadRequestException({
                error: true,
                code: 'ORDER_NOT_FOUND',
                message: 'Order tidak ditemukan',
            });
        }

        // Calculate subscription end date
        const now = new Date();
        const endDate = new Date(now);
        if (order.billing_cycle === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
        } else {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }

        // Create/update subscription
        await this.supabaseService.getAdminClient()
            .from('subscriptions')
            .upsert({
                user_id: userId,
                plan: order.plan_id,
                status: 'active',
                current_period_start: now.toISOString(),
                current_period_end: endDate.toISOString(),
                midtrans_subscription_id: dto.transactionId,
                updated_at: now.toISOString(),
            }, { onConflict: 'user_id' });

        // Update order status
        await this.supabaseService.getAdminClient()
            .from('payment_orders')
            .update({ status: 'completed' })
            .eq('id', dto.orderId);

        this.logger.log(`Payment verified for order ${dto.orderId}, subscription activated`);

        return {
            success: true,
            subscription: {
                planId: order.plan_id,
                expiresAt: endDate.toISOString(),
                status: 'active',
            },
            message: 'Pembayaran berhasil! Subscription aktif.',
        };
    }

    /**
     * Get active subscription for user
     */
    async getActiveSubscription(userId: string): Promise<any | null> {
        const { data } = await this.supabaseService.getAdminClient()
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .gte('current_period_end', new Date().toISOString())
            .single();

        return data;
    }

    /**
     * Create Midtrans Snap token
     */
    private async createSnapToken(params: {
        orderId: string;
        amount: number;
        userId: string;
        userEmail: string;
        userName: string;
        planId: string;
        billingCycle: string;
    }): Promise<string> {
        // If Midtrans not configured, return mock token for development
        if (!this.serverKey) {
            this.logger.warn('Midtrans not configured, returning mock token');
            return `mock-snap-token-${params.orderId}`;
        }

        const auth = Buffer.from(`${this.serverKey}:`).toString('base64');
        const snapUrl = this.isProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        const payload = {
            transaction_details: {
                order_id: params.orderId,
                gross_amount: params.amount,
            },
            customer_details: {
                email: params.userEmail,
                first_name: params.userName,
            },
            item_details: [{
                id: params.planId,
                price: params.amount,
                quantity: 1,
                name: `Orenax ${params.planId.charAt(0).toUpperCase() + params.planId.slice(1)} - ${params.billingCycle}`,
            }],
        };

        try {
            const response = await fetch(snapUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error_messages?.join(', ') || 'Failed to create Snap token');
            }

            return data.token;
        } catch (error) {
            this.logger.error(`Failed to create Snap token: ${error.message}`);
            throw new BadRequestException('Gagal membuat pembayaran, silakan coba lagi');
        }
    }

    /**
     * Check transaction status with Midtrans
     */
    private async checkTransactionStatus(orderId: string): Promise<any> {
        // If Midtrans not configured, return mock success for development
        if (!this.serverKey) {
            this.logger.warn('Midtrans not configured, returning mock success');
            return { transaction_status: 'settlement' };
        }

        const auth = Buffer.from(`${this.serverKey}:`).toString('base64');
        const statusUrl = `${this.baseUrl}/v2/${orderId}/status`;

        try {
            const response = await fetch(statusUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${auth}`,
                },
            });

            return await response.json();
        } catch (error) {
            this.logger.error(`Failed to check transaction status: ${error.message}`);
            throw new BadRequestException('Gagal memverifikasi pembayaran');
        }
    }
}
