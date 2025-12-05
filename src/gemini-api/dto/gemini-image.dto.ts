import { IsString, IsOptional, IsNumber, IsIn, Min, Max } from 'class-validator';

/**
 * Image Generation Request DTO
 */
export class GeminiImageGenerationDto {
    @IsString()
    prompt: string;

    @IsOptional()
    @IsString()
    negativePrompt?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(4)
    numberOfImages?: number;

    @IsOptional()
    @IsString()
    @IsIn(['1:1', '16:9', '9:16', '4:3', '3:4'])
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

    @IsOptional()
    @IsString()
    @IsIn(['png', 'jpeg'])
    outputFormat?: 'png' | 'jpeg';

    @IsOptional()
    @IsString()
    model?: string;
}
