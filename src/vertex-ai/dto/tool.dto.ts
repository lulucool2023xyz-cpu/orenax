import { IsString, IsObject, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Function Declaration DTO
 * Defines a function that the model can call
 */
export class FunctionDeclarationDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsObject()
    parameters?: any; // JSON Schema object
}

/**
 * Tool DTO - Contains function declarations
 * Phase 4: Function Calling
 */
export class ToolDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FunctionDeclarationDto)
    functionDeclarations: FunctionDeclarationDto[];
}

/**
 * Function Call Response DTO
 * When model requests a function call
 */
export class FunctionCallDto {
    @IsString()
    name: string;

    @IsObject()
    args: any;
}

/**
 * Function Response DTO
 * Response from executed function
 */
export class FunctionResponseDto {
    @IsString()
    name: string;

    @IsObject()
    response: any;
}
