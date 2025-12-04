import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;
    private supabaseAdmin: SupabaseClient | null = null;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');
        const supabaseServiceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase URL and Key must be provided in environment variables');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);

        if (supabaseServiceRoleKey) {
            this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
        }
    }

    getClient(): SupabaseClient {
        return this.supabase;
    }

    getAdminClient(): SupabaseClient {
        if (!this.supabaseAdmin) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
        }
        return this.supabaseAdmin;
    }
}
