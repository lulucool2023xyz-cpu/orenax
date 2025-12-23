import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
import { GoogleLoginDto } from '../dto/google-login.dto';
import { FacebookLoginDto } from '../dto/facebook-login.dto';
import { GitHubLoginDto } from '../dto/github-login.dto';

/**
 * OAuth Service
 * Handles all OAuth provider authentication (Google, Facebook, GitHub)
 */
@Injectable()
export class OAuthService {
    private readonly logger = new Logger(OAuthService.name);

    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly configService: ConfigService,
    ) { }

    private getDefaultRedirect(): string {
        return this.configService.get<string>('OAUTH_REDIRECT_URL') ||
            `${this.configService.get<string>('APP_URL', 'http://localhost:3001')}/auth/callback`;
    }

    private formatAuthResponse(data: any, provider: string) {
        return {
            message: `${provider} login successful`,
            user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
                fullName: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
                avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
                provider: provider.toLowerCase(),
            },
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresIn: data.session.expires_in,
            expiresAt: data.session.expires_at,
            session: data.session,
        };
    }

    // === OAuth URL Generators ===

    async getGoogleOAuthUrl(redirectTo?: string) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectTo || this.getDefaultRedirect(),
                scopes: 'email profile',
            },
        });

        if (error) {
            this.logger.error(`Failed to generate Google OAuth URL: ${error.message}`);
            throw new BadRequestException(error.message);
        }

        return { url: data.url, provider: 'google' };
    }

    async getFacebookOAuthUrl(redirectTo?: string) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
                redirectTo: redirectTo || this.getDefaultRedirect(),
                scopes: 'email public_profile',
            },
        });

        if (error) {
            this.logger.error(`Failed to generate Facebook OAuth URL: ${error.message}`);
            throw new BadRequestException(error.message);
        }

        return { url: data.url, provider: 'facebook' };
    }

    async getGitHubOAuthUrl(redirectTo?: string) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: redirectTo || this.getDefaultRedirect(),
                scopes: 'user:email read:user',
            },
        });

        if (error) {
            this.logger.error(`Failed to generate GitHub OAuth URL: ${error.message}`);
            throw new BadRequestException(error.message);
        }

        return { url: data.url, provider: 'github' };
    }

    // === Token-based OAuth Login ===

    async loginWithGoogle(googleLoginDto: GoogleLoginDto) {
        const supabase = this.supabaseService.getClient();
        this.logger.log('Attempting Google login with ID token');

        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: googleLoginDto.accessToken,
        });

        if (error) {
            this.logger.error(`Google login failed: ${error.message}`);
            throw new UnauthorizedException(error.message);
        }

        if (!data.user || !data.session) {
            throw new UnauthorizedException('Google authentication failed');
        }

        this.logger.log(`Google login successful: ${data.user.email}`);
        return this.formatAuthResponse(data, 'Google');
    }

    async loginWithFacebook(facebookLoginDto: FacebookLoginDto) {
        const supabase = this.supabaseService.getClient();
        this.logger.log('Attempting Facebook login with access token');

        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'facebook',
            token: facebookLoginDto.accessToken,
        });

        if (error) {
            this.logger.error(`Facebook login failed: ${error.message}`);
            throw new UnauthorizedException(error.message);
        }

        if (!data.user || !data.session) {
            throw new UnauthorizedException('Facebook authentication failed');
        }

        this.logger.log(`Facebook login successful: ${data.user.email}`);
        return this.formatAuthResponse(data, 'Facebook');
    }

    async loginWithGitHub(githubLoginDto: GitHubLoginDto) {
        const supabase = this.supabaseService.getClient();
        this.logger.log('Attempting GitHub login with access token');

        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'github',
            token: githubLoginDto.accessToken,
        });

        if (error) {
            this.logger.error(`GitHub login failed: ${error.message}`);
            throw new UnauthorizedException(error.message);
        }

        if (!data.user || !data.session) {
            throw new UnauthorizedException('GitHub authentication failed');
        }

        this.logger.log(`GitHub login successful: ${data.user.email}`);
        return {
            ...this.formatAuthResponse(data, 'GitHub'),
            user: {
                ...this.formatAuthResponse(data, 'GitHub').user,
                username: data.user.user_metadata?.user_name,
            },
        };
    }

    // === OAuth Code Exchange ===

    async exchangeCodeForSession(code: string) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            this.logger.error(`OAuth code exchange failed: ${error.message}`);
            throw new UnauthorizedException(error.message);
        }

        if (!data.user || !data.session) {
            throw new UnauthorizedException('OAuth authentication failed');
        }

        this.logger.log(`OAuth login successful: ${data.user.email}`);
        return {
            ...this.formatAuthResponse(data, 'OAuth'),
            user: {
                ...this.formatAuthResponse(data, 'OAuth').user,
                provider: data.user.app_metadata?.provider,
            },
        };
    }
}
