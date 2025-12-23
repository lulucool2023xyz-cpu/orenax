import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

/**
 * Email Auth Service
 * Handles email/password based authentication
 */
@Injectable()
export class EmailAuthService {
    private readonly logger = new Logger(EmailAuthService.name);

    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly configService: ConfigService,
    ) { }

    private formatUserResponse(user: any, session?: any) {
        const response: any = {
            user: {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name,
                fullName: user.user_metadata?.name,
                emailVerified: !!user.email_confirmed_at,
            },
        };

        if (session) {
            response.accessToken = session.access_token;
            response.refreshToken = session.refresh_token;
            response.expiresIn = session.expires_in;
            response.expiresAt = session.expires_at;
            response.session = session;
        }

        return response;
    }

    async register(registerDto: RegisterDto) {
        const { email, password, name, fullName } = registerDto;
        const finalName = name || fullName;

        if (!finalName) {
            throw new BadRequestException('Name is required');
        }

        try {
            const supabaseAdmin = this.supabaseService.getAdminClient();

            const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: false, // DO NOT auto confirm
                user_metadata: { name: finalName }
            });

            if (adminError) {
                throw new BadRequestException(adminError.message);
            }

            if (!adminData.user) {
                throw new BadRequestException('Registration failed');
            }

            this.logger.log(`User registered successfully (pending verification): ${email}`);

            return {
                message: 'Registration successful. Please check your email for verification.',
                ...this.formatUserResponse(adminData.user),
                session: null,
                requireVerification: true
            };

        } catch (e) {
            if (e.message === 'SUPABASE_SERVICE_ROLE_KEY is not configured') {
                const supabase = this.supabaseService.getClient();
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { name: finalName } },
                });

                if (error) throw new BadRequestException(error.message);

                return {
                    message: 'Registration successful. Please check your email for verification.',
                    ...this.formatUserResponse(data.user),
                    session: data.session,
                    requireVerification: !data.session
                };
            }
            throw e;
        }
    }

    async login(loginDto: LoginDto) {
        const supabase = this.supabaseService.getClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginDto.email,
            password: loginDto.password,
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
            ...this.formatUserResponse(data.user, data.session),
        };
    }

    async logout(accessToken: string) {
        const supabase = this.supabaseService.getClient();

        const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: '',
        });

        if (sessionError) {
            throw new UnauthorizedException('Invalid session');
        }

        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new BadRequestException(error.message);
        }

        return { message: 'Logout successful' };
    }

    async getCurrentUser(accessToken: string) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase.auth.getUser(accessToken);

        if (error) {
            throw new UnauthorizedException(error.message);
        }

        if (!data.user) {
            throw new UnauthorizedException('User not found');
        }

        return this.formatUserResponse(data.user);
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto) {
        const supabase = this.supabaseService.getClient();

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshTokenDto.refreshToken,
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
        }

        // Don't reveal if email exists
        return {
            message: 'If an account exists with this email, you will receive a password reset link.',
            success: true,
        };
    }

    async updatePassword(accessToken: string, newPassword: string) {
        const supabase = this.supabaseService.getClient();

        const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: '',
        });

        if (sessionError) {
            this.logger.error(`Session error: ${sessionError.message}`);
            throw new UnauthorizedException('Invalid or expired reset token');
        }

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
}
