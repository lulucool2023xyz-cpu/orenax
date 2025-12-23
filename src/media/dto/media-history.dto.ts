import { IsOptional, IsString, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class MediaHistoryQueryDto {
    @IsOptional()
    @IsString()
    @IsIn(['image', 'video', 'music'])
    type?: 'image' | 'video' | 'music';

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(50)
    limit?: number = 20;
}

export interface MediaHistoryItem {
    id: string;
    type: 'image' | 'video' | 'music';
    url: string;
    thumbnailUrl: string | null;
    prompt: string;
    model: string;
    createdAt: string;
    metadata: {
        width?: number;
        height?: number;
        format?: string;
        size?: number;
        duration?: number;
    };
}

export interface MediaHistoryResponse {
    items: MediaHistoryItem[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
