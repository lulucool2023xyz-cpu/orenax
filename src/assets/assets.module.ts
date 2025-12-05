import { Module } from '@nestjs/common';
import { GeneratedAssetsService } from './generated-assets.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    providers: [GeneratedAssetsService],
    exports: [GeneratedAssetsService],
})
export class AssetsModule { }
