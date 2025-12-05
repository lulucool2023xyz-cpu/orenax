import { Controller, Post, Body, HttpCode, HttpStatus, Get, Headers, UnauthorizedException, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { FacebookLoginDto } from './dto/facebook-login.dto';
import { GitHubLoginDto } from './dto/github-login.dto';
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

    /**
     * Get Google OAuth URL - redirect user to this URL
     */
    @Get('google/url')
    async getGoogleOAuthUrl(@Query('redirectTo') redirectTo?: string) {
        return this.authService.getGoogleOAuthUrl(redirectTo);
    }

    /**
     * Get Facebook OAuth URL - redirect user to this URL
     */
    @Get('facebook/url')
    async getFacebookOAuthUrl(@Query('redirectTo') redirectTo?: string) {
        return this.authService.getFacebookOAuthUrl(redirectTo);
    }

    /**
     * Get GitHub OAuth URL - redirect user to this URL
     */
    @Get('github/url')
    async getGitHubOAuthUrl(@Query('redirectTo') redirectTo?: string) {
        return this.authService.getGitHubOAuthUrl(redirectTo);
    }

    /**
     * Login with GitHub OAuth token
     */
    @HttpCode(HttpStatus.OK)
    @Post('github')
    async loginWithGitHub(@Body() githubLoginDto: GitHubLoginDto) {
        return this.authService.loginWithGitHub(githubLoginDto);
    }

    /**
     * OAuth callback - exchange code for session
     * This can be called by frontend after OAuth redirect
     */
    @Get('callback')
    async handleOAuthCallback(
        @Query('code') code: string,
        @Query('redirect') redirect?: string,
        @Res() res?: Response,
    ) {
        if (!code) {
            throw new UnauthorizedException('No authorization code provided');
        }

        const result = await this.authService.exchangeCodeForSession(code);

        // If redirect URL is provided, redirect with token as query param
        if (redirect && res) {
            const redirectUrl = new URL(redirect);
            redirectUrl.searchParams.set('accessToken', result.accessToken);
            redirectUrl.searchParams.set('refreshToken', result.refreshToken);
            return res.redirect(redirectUrl.toString());
        }

        // Otherwise return JSON response
        if (res) {
            return res.json(result);
        }
        return result;
    }

    /**
     * Exchange OAuth code for session (POST version)
     */
    @HttpCode(HttpStatus.OK)
    @Post('callback')
    async exchangeCode(@Body('code') code: string) {
        if (!code) {
            throw new UnauthorizedException('No authorization code provided');
        }
        return this.authService.exchangeCodeForSession(code);
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
