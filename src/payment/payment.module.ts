import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { SubscriptionController } from './subscription.controller';
import { PaymentService } from './payment.service';
import { SubscriptionService } from './subscription.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [PaymentController, SubscriptionController],
    providers: [PaymentService, SubscriptionService],
    exports: [PaymentService, SubscriptionService],
})
export class PaymentModule { }
