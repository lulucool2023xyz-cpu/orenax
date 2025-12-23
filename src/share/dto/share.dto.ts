import { IsString, IsOptional, IsNumber, Min, Max, IsUUID } from 'class-validator';

export class CreateShareDto {
    @IsString()
    @IsUUID()
    conversationId: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(8760) // Max 1 year in hours
    expiresIn?: number; // hours, null = never expires
}

export interface SharedMessage {
    role: 'user' | 'model';
    content: string;
    timestamp: string;
}

export interface SharedChatResponse {
    id: string;
    title: string;
    messages: SharedMessage[];
    messageCount: number;
    createdAt: string;
    author: {
        name: string;
        avatar: string | null;
    };
}

export interface CreateShareResponse {
    shareId: string;
    shareUrl: string;
    expiresAt: string | null;
    isPublic: boolean;
}
