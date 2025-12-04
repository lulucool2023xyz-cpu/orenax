import { Controller, Post, Body, HttpCode, HttpStatus, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { FacebookLoginDto } from './dto/facebook-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('google')
    async loginWithGoogle(@Body() googleLoginDto: GoogleLoginDto) {
        return this.authService.loginWithGoogle(googleLoginDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('facebook')
    async loginWithFacebook(@Body() facebookLoginDto: FacebookLoginDto) {
        return this.authService.loginWithFacebook(facebookLoginDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(@Headers('authorization') authorization: string) {
        if (!authorization) {
            throw new UnauthorizedException('No authorization header');
        }

        const token = authorization.replace('Bearer ', '');
        return this.authService.logout(token);
    }

    @Get('me')
    async getCurrentUser(@Headers('authorization') authorization: string) {
        if (!authorization) {
            throw new UnauthorizedException('No authorization header');
        }

        const token = authorization.replace('Bearer ', '');
        return this.authService.getCurrentUser(token);
    }

    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }
}
