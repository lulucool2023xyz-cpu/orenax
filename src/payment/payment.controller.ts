import {
    Controller,
    Post,
    Get,
    Body,
    Headers,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    Logger,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentService } from './payment.service';
import type { MidtransNotification } from './payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

/**
 * Payment Controller
 * Handles payment creation, verification, webhook, and history
 */
@Controller('api/v2/payment')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(private readonly paymentService: PaymentService) { }

    /**
     * POST /api/v2/payment/create-order
     * Create a new order for subscription payment
     */
    @Post('create-order')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async createOrder(@Body() dto: CreateOrderDto, @Req() req: AuthenticatedRequest) {
        const userId = req.user?.sub || req.user?.id;
        this.logger.log(`Create order request - User: ${userId}, Plan: ${dto.planId}`);
        return this.paymentService.createOrder(userId, dto);
    }

    /**
     * POST /api/v2/payment/verify
     * Verify payment after user completes payment (client-side callback)
     */
    @Post('verify')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async verifyPayment(@Body() dto: VerifyPaymentDto, @Req() req: AuthenticatedRequest) {
        const userId = req.user?.sub || req.user?.id;
        this.logger.log(`Verify payment request - User: ${userId}, Order: ${dto.orderId}`);
        return this.paymentService.verifyPayment(userId, dto);
    }

    /**
     * POST /api/v2/payment/webhook
     * Handle Midtrans server-to-server notification
     * NO AUTHENTICATION - Midtrans uses signature verification
     */
    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    async handleWebhook(
        @Body() notification: MidtransNotification,
        @Headers('x-signature-key') signature: string,
    ) {
        this.logger.log(`Webhook received - Order: ${notification.order_id}, Status: ${notification.transaction_status}`);
        return this.paymentService.handleWebhook(notification, signature || '');
    }

    /**
     * GET /api/v2/payment/history
     * Get payment history for authenticated user
     */
    @Get('history')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getPaymentHistory(@Req() req: AuthenticatedRequest) {
        const userId = req.user?.sub || req.user?.id;
        this.logger.log(`Payment history request - User: ${userId}`);
        return this.paymentService.getPaymentHistory(userId);
    }
}
