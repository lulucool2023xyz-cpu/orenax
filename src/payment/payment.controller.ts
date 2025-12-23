import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    Logger,
} from '@nestjs/common';
import { Request } from 'express';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentService } from './payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

/**
 * Payment Controller
 * Handles payment creation and verification for subscriptions
 */
@Controller('api/v2/payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(private readonly paymentService: PaymentService) { }

    /**
     * POST /api/v2/payment/create-order
     * Create a new order for subscription payment
     */
    @Post('create-order')
    @HttpCode(HttpStatus.OK)
    async createOrder(@Body() dto: CreateOrderDto, @Req() req: AuthenticatedRequest) {
        const userId = req.user?.sub || req.user?.id;
        this.logger.log(`Create order request - User: ${userId}, Plan: ${dto.planId}`);
        return this.paymentService.createOrder(userId, dto);
    }

    /**
     * POST /api/v2/payment/verify
     * Verify payment after user completes payment
     */
    @Post('verify')
    @HttpCode(HttpStatus.OK)
    async verifyPayment(@Body() dto: VerifyPaymentDto, @Req() req: AuthenticatedRequest) {
        const userId = req.user?.sub || req.user?.id;
        this.logger.log(`Verify payment request - User: ${userId}, Order: ${dto.orderId}`);
        return this.paymentService.verifyPayment(userId, dto);
    }
}
