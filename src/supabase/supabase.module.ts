import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { MediaStorageService } from './media-storage.service';

@Global()
@Module({
    providers: [SupabaseService, MediaStorageService],
    exports: [SupabaseService, MediaStorageService],
})
export class SupabaseModule { }
