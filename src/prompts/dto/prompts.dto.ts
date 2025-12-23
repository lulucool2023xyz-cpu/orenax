import { IsString, IsOptional, IsBoolean, IsNumber, Min, Max, IsIn, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromptDto {
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    title: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsString()
    @MinLength(1)
    prompt: string;

    @IsOptional()
    @IsString()
    @IsIn(['writing', 'coding', 'marketing', 'education', 'creative', 'business'])
    category?: string;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean = false;
}

export class UpdatePromptDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    title?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    prompt?: string;

    @IsOptional()
    @IsString()
    @IsIn(['writing', 'coding', 'marketing', 'education', 'creative', 'business'])
    category?: string;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}

export class PromptsQueryDto {
    @IsOptional()
    @IsString()
    @IsIn(['writing', 'coding', 'marketing', 'education', 'creative', 'business'])
    category?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string;

    @IsOptional()
    @IsString()
    @IsIn(['popular', 'recent', 'rating'])
    sort?: 'popular' | 'recent' | 'rating' = 'popular';

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

export interface PromptAuthor {
    id: string;
    name: string;
    avatar: string | null;
}

export interface PromptItem {
    id: string;
    title: string;
    description: string | null;
    prompt: string;
    category: string | null;
    author: PromptAuthor;
    uses: number;
    rating: number;
    ratingCount: number;
    isPublic: boolean;
    isSaved: boolean;
    createdAt: string;
}

export interface PromptsListResponse {
    prompts: PromptItem[];
    total: number;
    page: number;
    hasMore: boolean;
    categories: string[];
}

export interface UsePromptResponse {
    success: boolean;
    prompt: string;
    variables: string[];
}
