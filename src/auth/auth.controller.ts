// auth.controller.ts
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Google OAuth login entry point
   * - GET /auth/google
   * - Redirects to Google login page
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Passport automatically redirects to Google login page
  }

  /**
   * Google OAuth callback URL
   * - GET /auth/google/callback
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    // Extract user information from req.user
    const { user } = req;
    // Generate JWT token
    const jwt = await this.authService.loginWithGoogle(user);
    // Set the access_token in an HTTP-only cookie
    res.cookie('access_token', jwt.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      sameSite: 'lax', // Adjust as needed ('strict', 'lax', 'none')
      maxAge: 3600000, // 1 hour in milliseconds
    });

    res.redirect(process.env.CLIENT_CALLBACK_URL);
  }

  /**
   * Protected route example: Requires JWT token
   * - GET /auth/profile
   */
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: any) {
    return {
      message: 'Authenticated user profile information',
      user: req.user,
    };
  }
}
