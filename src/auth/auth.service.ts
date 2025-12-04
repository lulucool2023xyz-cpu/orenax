import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { FacebookLoginDto } from './dto/facebook-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private supabaseService: SupabaseService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password, name } = registerDto;

        try {
            // Try to use Admin client to auto-confirm user
            const supabaseAdmin = this.supabaseService.getAdminClient();

            // Create user with admin privileges (auto confirm email)
            const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true, // Auto confirm email
                user_metadata: { name }
            });

            if (adminError) {
                throw new BadRequestException(adminError.message);
            }

            if (!adminData.user) {
                throw new BadRequestException('Registration failed');
            }

            // Immediately login to get tokens
            const { data: loginData, error: loginError } = await this.supabaseService.getClient().auth.signInWithPassword({
                email,
                password,
            });

            if (loginError) {
                // If login fails but registration succeeded, return user without session
                return {
                    message: 'Registration successful. Please login.',
                    user: {
                        id: adminData.user.id,
                        email: adminData.user.email,
                        name: adminData.user.user_metadata?.name,
                    },
                    session: null,
                };
            }

            return {
                message: 'Registration successful',
                user: {
                    id: loginData.user.id,
                    email: loginData.user.email,
                    name: loginData.user.user_metadata?.name,
                },
                session: loginData.session,
            };

        } catch (e) {
            // Fallback to normal registration if Admin client fails (e.g. no service key)
            if (e.message === 'SUPABASE_SERVICE_ROLE_KEY is not configured') {
                const supabase = this.supabaseService.getClient();
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { name },
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
                    session: data.session,
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

        return {
            message: 'Login successful',
            user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name,
            },
            session: data.session,
        };
    }

    async loginWithGoogle(googleLoginDto: GoogleLoginDto) {
        const { accessToken } = googleLoginDto;
        const supabase = this.supabaseService.getClient();

        // Sign in with Google access token
        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: accessToken,
        });

        if (error) {
            throw new UnauthorizedException(error.message);
        }

        if (!data.user || !data.session) {
            throw new UnauthorizedException('Google authentication failed');
        }

        return {
            message: 'Google login successful',
            user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
            },
            session: data.session,
        };
    }

    async loginWithFacebook(facebookLoginDto: FacebookLoginDto) {
        const { accessToken } = facebookLoginDto;
        const supabase = this.supabaseService.getClient();

        // Sign in with Facebook access token
        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'facebook',
            token: accessToken,
        });

        if (error) {
            throw new UnauthorizedException(error.message);
        }

        if (!data.user || !data.session) {
            throw new UnauthorizedException('Facebook authentication failed');
        }

        return {
            message: 'Facebook login successful',
            user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
            },
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
}
