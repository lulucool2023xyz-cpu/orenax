import { IsString, IsOptional, MinLength, MaxLength, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateApiKeyDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name: string;
}

export class ApiKeyUsageQueryDto {
    @IsOptional()
    @IsString()
    @IsIn(['daily', 'monthly'])
    period?: 'daily' | 'monthly' = 'daily';
}

export interface ApiKeyItem {
    id: string;
    name: string;
    prefix: string;
    createdAt: string;
    lastUsed: string | null;
    usageCount: number;
}

export interface ApiKeysListResponse {
    keys: ApiKeyItem[];
    limit: number;
    remaining: number;
}

export interface CreateApiKeyResponse {
    id: string;
    name: string;
    key: string;  // Only shown once
    prefix: string;
    message: string;
}

export interface ApiUsageResponse {
    period: 'daily' | 'monthly';
    date: string;
    usage: {
        chat: number;
        image: number;
        video: number;
        music: number;
        tts: number;
    };
    limits: {
        chat: number;
        image: number;
        video: number;
        music: number;
        tts: number;
    };
    percentUsed: {
        chat: number;
        image: number;
        video: number;
        music: number;
        tts: number;
    };
}
