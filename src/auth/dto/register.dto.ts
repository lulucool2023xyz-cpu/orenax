import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(2)
    @IsOptional()
    name?: string;

    @IsString()
    @MinLength(2)
    @IsOptional()
    fullName?: string;

    @IsString()
    @MinLength(6)
    password: string;
}
