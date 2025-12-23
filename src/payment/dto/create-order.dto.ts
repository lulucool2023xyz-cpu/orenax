import { IsString, IsIn } from 'class-validator';

export class CreateOrderDto {
    @IsString()
    @IsIn(['pro', 'enterprise'])
    planId: 'pro' | 'enterprise';

    @IsString()
    @IsIn(['monthly', 'yearly'])
    billingCycle: 'monthly' | 'yearly';
}

export interface CreateOrderResponse {
    orderId: string;
    snapToken: string;
    clientSecret?: string;
    amount: number;
    currency: 'IDR';
    expiresAt: string;
}
