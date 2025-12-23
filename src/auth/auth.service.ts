import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { FacebookLoginDto } from './dto/facebook-login.dto';
import { GitHubLoginDto } from './dto/github-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private jwtService: JwtService,
        private supabaseService: SupabaseService,
        private configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password, name, fullName } = registerDto;
        const finalName = name || fullName;

        if (!finalName) {
            throw new BadRequestException('Name is required');
        }

        try {
            // Try to use Admin client to register user
            const supabaseAdmin = this.supabaseService.getAdminClient();

            // Create user with admin privileges but WITHOUT auto-confirm
            // This ensures the user receives an email verification link
            const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: false, // DO NOT auto confirm - enforce email verification
                user_metadata: { name: finalName }
            });

            if (adminError) {
                throw new BadRequestException(adminError.message);
            }

            if (!adminData.user) {
                throw new BadRequestException('Registration failed');
            }

            this.logger.log(`User registered successfully (pending verification): ${email}`);

            // Return success message without session tokens
            // User must check email to verify account
            return {
                message: 'Registration successful. Please check your email for verification link.',
                user: {
                    id: adminData.user.id,
                    email: adminData.user.email,
                    name: adminData.user.user_metadata?.name,
                    fullName: adminData.user.user_metadata?.name,
                    emailVerified: false
                },
                requireVerification: true
            };

        } catch (e) {
            // Fallback to normal registration if Admin client fails (e.g. no service key)
            if (e.message === 'SUPABASE_SERVICE_ROLE_KEY is not configured') {
                const supabase = this.supabaseService.getClient();
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { name: finalName },
                    },
                });

                if (error) throw new BadRequestException(error.message);

                return {
                    message: 'Registration successful. Please check your email for verification.',
                    user: {
                        id: data.user?.id,
                        email: data.user?.email,
                        name: data.user?.user_metadata?.name,
                    },
                    session: data.session, // Session might be null if email confirmation is required
                    requireVerification: !data.session
                };
            }
            throw e;
        }
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
        const supabase = this.supabaseService.getClient();

        // Login with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new UnauthorizedException(error.message);
        }

        if (!data.user || !data.session) {
            throw new UnauthorizedException('Invalid credentials');
        }

        this.logger.log(`User logged in successfully: ${data.user.email}`);
        return {
            message: 'Login successful',
            user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name,
                fullName: data.user.user_metadata?.name,
            },
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresIn: data.session.expires_in,
            expiresAt: data.session.expires_at,
            session: data.session,
        };
    }

    async loginWithGoogle(googleLoginDto: GoogleLoginDto) {
        const { accessToken } = googleLoginDto;
        const supabase = this.supabaseService.getClient();

        this.logger.log('Attempting Google login with ID token');

        // Sign in with Google ID token (obtained from Google Sign-In on frontend)
        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: accessToken,
        });

        if (error) {
            this.logger.error(`Google login failed: ${error.message}`);
            throw new UnauthorizedException(error.message);
        }

        if (!data.user || !data.session) {
            throw new UnauthorizedException('Google authentication failed');
        }

        this.logger.log(`Google login successful: ${data.user.email}`);
        return {
            message: 'Google login successful',
            user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
                fullName: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
                avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
            },
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresIn: data.session.expires_in,
            expiresAt: data.session.expires_at,
            session: data.session,
        };
    }

    async loginWithFacebook(facebookLoginDto: FacebookLoginDto) {
        const { accessToken } = facebookLoginDto;
        const supabase = this.supabaseService.getClient();

        this.logger.log('Attempting Facebook login with access token');

        // Sign in with Facebook access token
        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'facebook',
            token: accessToken,
        });

        if (error) {
            this.logger.error(`Facebook login failed: ${error.message}`);
            throw new UnauthorizedException(error.message);
        }

        if (!data.user || !data.session) {
            throw new UnauthorizedException('Facebook authentication failed');
        }

        this.logger.log(`Facebook login successful: ${data.user.email}`);
        return {
            message: 'Facebook login successful',
            user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
                fullName: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
                avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
            },
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresIn: data.session.expires_in,
            expiresAt: data.session.expires_at,
            session: data.session,
        };
    }

    async logout(accessToken: string) {
        const supabase = this.supabaseService.getClient();

        // Set the session before logout
        const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: '', // We only need access token for logout
        });

        if (sessionError) {
            throw new UnauthorizedException('Invalid session');
        }

        // Logout from Supabase
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new BadRequestException(error.message);
        }

        return {
            message: 'Logout successful',
        };
    }

    async getCurrentUser(accessToken: string) {
        const supabase = this.supabaseService.getClient();

        // Get user from access token
        const { data, error } = await supabase.auth.getUser(accessToken);

        if (error) {
            throw new UnauthorizedException(error.message);
        }

        if (!data.user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
                emailVerified: !!data.user.email_confirmed_at,
            },
        };
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto) {
        const { refreshToken } = refreshTokenDto;
        const supabase = this.supabaseService.getClient();

        // Refresh the session
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
        });

        if (error) {
            throw new UnauthorizedException(error.message);
        }

        if (!data.session) {
            throw new UnauthorizedException('Failed to refresh token');
        }

        return {
            message: 'Token refreshed successfully',
            session: data.session,
        };
    }

    async validateUser(email: string): Promise<any> {
        const supabase = this.supabaseService.getClient();

        // This method is for JWT strategy validation
        const { data, error } = await supabase.auth.admin.listUsers();

        if (error) {
            return null;
        }

        const user = data.users.find((u) => u.email === email);
        if (user) {
            return {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name,
            };
        }

        return null;
    }

    /**
     * Send password reset email via Supabase
     */
    async forgotPassword(email: string, redirectTo?: string) {
        const supabase = this.supabaseService.getClient();
        const defaultRedirect = this.configService.get<string>('OAUTH_REDIRECT_URL') ||
            `${this.configService.get<string>('APP_URL', 'http://localhost:5173')}/auth/reset-password`;

        this.logger.log(`Sending password reset email to: ${email}`);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectTo || defaultRedirect,
        });

        if (error) {
            this.logger.error(`Password reset failed: ${error.message}`);
            // Don't reveal if email exists or not for security
            // Always return success message
        }

        return {
            message: 'If an account exists with this email, you will receive a password reset link.',
            success: true,
        };
    }

    /**
     * Update user password (used after reset link is clicked)
     */
    async updatePassword(accessToken: string, newPassword: string) {
        const supabase = this.supabaseService.getClient();

        // Set session with the access token from reset link
        const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: '', // Not needed for password update
        });

        if (sessionError) {
            this.logger.error(`Session error: ${sessionError.message}`);
            throw new UnauthorizedException('Invalid or expired reset token');
        }

        // Update the password
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            this.logger.error(`Password update failed: ${error.message}`);
            throw new BadRequestException(error.message);
        }

        this.logger.log(`Password updated successfully for user: ${data.user?.email}`);
        return {
            message: 'Password updated successfully',
            success: true,
        };
    }

    /**
     * Generate OAuth URL for Google login via Supabase
     * Frontend should redirect user to this URL
     */
    async getGoogleOAuthUrl(redirectTo?: string) {
        const supabase = this.supabaseService.getClient();
        const defaultRedirect = this.configService.get<string>('OAUTH_REDIRECT_URL') ||
            `${this.configService.get<string>('APP_URL', 'http://localhost:3001')}/auth/callback`;

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectTo || defaultRedirect,
                scopes: 'email profile',
            },
        });

        if (error) {
            this.logger.error(`Failed to generate Google OAuth URL: ${error.message}`);
            throw new BadRequestException(error.message);
        }

        this.logger.log('Generated Google OAuth URL');
        return {
            url: data.url,
            provider: 'google',
        };
    }

    /**
     * Generate OAuth URL for Facebook login via Supabase
     * Frontend should redirect user to this URL
     */
    async getFacebookOAuthUrl(redirectTo?: string) {
        const supabase = this.supabaseService.getClient();
        const defaultRedirect = this.configService.get<string>('OAUTH_REDIRECT_URL') ||
            `${this.configService.get<string>('APP_URL', 'http://localhost:3001')}/auth/callback`;

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
                redirectTo: redirectTo || defaultRedirect,
                scopes: 'email public_profile',
            },
        });

        if (error) {
            this.logger.error(`Failed to generate Facebook OAuth URL: ${error.message}`);
            throw new BadRequestException(error.message);
        }

        this.logger.log('Generated Facebook OAuth URL');
        return {
            url: data.url,
            provider: 'facebook',
        };
    }

    /**
     * Generate OAuth URL for GitHub login via Supabase
     * Frontend should redirect user to this URL
     */
    async getGitHubOAuthUrl(redirectTo?: string) {
        const supabase = this.supabaseService.getClient();
        const defaultRedirect = this.configService.get<string>('OAUTH_REDIRECT_URL') ||
            `${this.configService.get<string>('APP_URL', 'http://localhost:3001')}/auth/callback`;

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: redirectTo || defaultRedirect,
                scopes: 'user:email read:user',
            },
        });

        if (error) {
            this.logger.error(`Failed to generate GitHub OAuth URL: ${error.message}`);
            throw new BadRequestException(error.message);
        }

        this.logger.log('Generated GitHub OAuth URL');
        return {
            url: data.url,
            provider: 'github',
        };
    }

    /**
     * Login with GitHub OAuth token
     * For frontends that handle OAuth flow themselves
     */
    async loginWithGitHub(githubLoginDto: GitHubLoginDto) {
        const { accessToken } = githubLoginDto;
        const supabase = this.supabaseService.getClient();

        this.logger.log('Attempting GitHub login with access token');

        // Sign in with GitHub access token
        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'github',
            token: accessToken,
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
            message: 'GitHub login successful',
            user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || data.user.user_metadata?.user_name,
                fullName: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
                avatarUrl: data.user.user_metadata?.avatar_url,
                username: data.user.user_metadata?.user_name,
            },
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresIn: data.session.expires_in,
            expiresAt: data.session.expires_at,
            session: data.session,
        };
    }

    /**
     * Exchange OAuth code for session (callback handler)
     * Called after OAuth redirect returns with code
     */
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
            message: 'OAuth login successful',
            user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
                fullName: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
                avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
                provider: data.user.app_metadata?.provider,
            },
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresIn: data.session.expires_in,
            expiresAt: data.session.expires_at,
            session: data.session,
        };
    }

    // ============================================
    // EMAIL VERIFICATION (API v2)
    // ============================================

    // Simple in-memory rate limiting (in production, use Redis)
    private verificationRateLimit: Map<string, number> = new Map();

    /**
     * Resend email verification
     */
    async resendVerificationEmail(email: string): Promise<{
        success: boolean;
        message: string;
        retryAfter?: number;
    }> {
        if (!email) {
            throw new BadRequestException({
                error: true,
                code: 'EMAIL_REQUIRED',
                message: 'Email wajib diisi',
            });
        }

        // Check rate limit (60 seconds)
        const lastSent = this.verificationRateLimit.get(email);
        if (lastSent && Date.now() - lastSent < 60000) {
            const retryAfter = Math.ceil((60000 - (Date.now() - lastSent)) / 1000);
            throw new BadRequestException({
                error: true,
                code: 'RATE_LIMITED',
                message: `Tunggu ${retryAfter} detik sebelum mencoba lagi`,
            });
        }

        const supabase = this.supabaseService.getClient();

        try {
            // Check if user exists and is not verified
            const { data: userData } = await this.supabaseService
                .getAdminClient()
                .auth.admin.listUsers();

            const user = userData.users.find(u => u.email === email);

            if (!user) {
                throw new BadRequestException({
                    error: true,
                    code: 'USER_NOT_FOUND',
                    message: 'Email tidak terdaftar',
                });
            }

            if (user.email_confirmed_at) {
                throw new BadRequestException({
                    error: true,
                    code: 'ALREADY_VERIFIED',
                    message: 'Email sudah terverifikasi',
                });
            }

            // Resend verification email
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
            });

            if (error) {
                this.logger.error(`Failed to resend verification: ${error.message}`);
                throw new BadRequestException(error.message);
            }

            // Update rate limit
            this.verificationRateLimit.set(email, Date.now());

            this.logger.log(`Verification email resent to: ${email}`);
            return {
                success: true,
                message: 'Email verifikasi telah dikirim',
                retryAfter: 60,
            };
        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            this.logger.error(`Failed to resend verification: ${error.message}`);
            throw new BadRequestException('Gagal mengirim email verifikasi');
        }
    }

    /**
     * Verify email token and redirect
     */
    async verifyEmail(token: string, res: any): Promise<void> {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') ||
            this.configService.get<string>('APP_URL', 'http://localhost:5173');

        if (!token) {
            return res.redirect(`${frontendUrl}/auth/callback?verified=false&error=INVALID_TOKEN`);
        }

        try {
            const supabase = this.supabaseService.getClient();

            // Verify the token
            const { error } = await supabase.auth.verifyOtp({
                token_hash: token,
                type: 'email',
            });

            if (error) {
                this.logger.error(`Email verification failed: ${error.message}`);
                return res.redirect(`${frontendUrl}/auth/callback?verified=false&error=INVALID_TOKEN`);
            }

            this.logger.log('Email verified successfully');
            return res.redirect(`${frontendUrl}/auth/callback?verified=true`);
        } catch (error) {
            this.logger.error(`Email verification error: ${error.message}`);
            return res.redirect(`${frontendUrl}/auth/callback?verified=false&error=SERVER_ERROR`);
        }
    }
}
