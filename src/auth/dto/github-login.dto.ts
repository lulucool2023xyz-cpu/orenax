import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class GitHubLoginDto {
    @IsNotEmpty()
    @IsString()
    accessToken: string;

    @IsOptional()
    @IsString()
    refreshToken?: string;
}
