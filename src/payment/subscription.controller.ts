import {
    Controller,
    Get,
    Post,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    Logger,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';
import { PaymentService } from './payment.service';

/**
 * Subscription Controller
 * Handles subscription status and management
 */
@Controller('api/v2/subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
    private readonly logger = new Logger(SubscriptionController.name);

    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly paymentService: PaymentService,
    ) { }

    /**
     * GET /api/v2/subscription/status
     * Get current subscription status for the authenticated user
     */
    @Get('status')
    @HttpCode(HttpStatus.OK)
    async getStatus(@Req() req: AuthenticatedRequest) {
        const userId = req.user?.sub || req.user?.id;
        this.logger.log(`Subscription status request - User: ${userId}`);
        return this.subscriptionService.getSubscriptionStatus(userId);
    }

    /**
     * POST /api/v2/subscription/cancel
     * Cancel subscription (will end at period end)
     */
    @Post('cancel')
    @HttpCode(HttpStatus.OK)
    async cancelSubscription(@Req() req: AuthenticatedRequest) {
        const userId = req.user?.sub || req.user?.id;
        this.logger.log(`Cancel subscription request - User: ${userId}`);
        return this.paymentService.cancelSubscription(userId);
    }
}
