import { IsString } from 'class-validator';

export class VerifyPaymentDto {
    @IsString()
    orderId: string;

    @IsString()
    transactionId: string;
}

export interface VerifyPaymentResponse {
    success: boolean;
    subscription: {
        planId: string;
        expiresAt: string;
        status: string;
    };
    message: string;
}
