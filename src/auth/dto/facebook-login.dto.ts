import { IsString, IsNotEmpty } from 'class-validator';

export class FacebookLoginDto {
    @IsString()
    @IsNotEmpty()
    accessToken: string;
}
