import { IsOptional, IsNumber, IsString, IsBoolean, IsEnum } from 'class-validator';

/**
 * Thinking Level for Gemini 3 models
 */
export enum ThinkingLevel {
    LOW = 'LOW',
    HIGH = 'HIGH',
}

/**
 * Thinking Configuration DTO
 * Supports both Gemini 3 (thinkingLevel) and Gemini 2.5 (thinkingBudget)
 */
export class ThinkingConfigDto {
    /**
     * Thinking budget for Gemini 2.5 models
     * Number of tokens allocated for thinking
     */
    @IsOptional()
    @IsNumber()
    thinkingBudget?: number;

    /**
     * Thinking level for Gemini 3 models
     * LOW or HIGH
     */
    @IsOptional()
    @IsEnum(ThinkingLevel)
    thinkingLevel?: ThinkingLevel;

    /**
     * Include thoughts in response
     */
    @IsOptional()
    @IsBoolean()
    includeThoughts?: boolean;
}
