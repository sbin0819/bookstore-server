// auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Google OAuth 로그인
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Passport가 Google 로그인 페이지로 리다이렉트
  }

  /**
   * Google OAuth 콜백
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const { user } = req;
    const tokens = await this.authService.loginWithGoogle(user);

    // Instead of setting cookies, return tokens in the response body
    // For OAuth flows, it's common to redirect to the client with tokens
    // You can encode tokens in query parameters or handle them via a frontend endpoint

    // Example: Redirecting with tokens as query parameters (Not recommended for security reasons)
    // const clientUrl = `${process.env.CLIENT_CALLBACK_URL}?access_token=${tokens.access_token}`;
    // return res.redirect(clientUrl);

    // **Recommended Approach**: Redirect to frontend endpoint and have the frontend fetch tokens
    // Here, we'll return tokens in JSON (assuming the client handles the response accordingly)
    return res.json({
      access_token: tokens.access_token,
      message: 'Google authentication successful',
    });
  }

  /**
   * 로컬 회원가입
   */
  @Post('signup')
  async signUp(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const tokens = await this.authService.signUp(username, email, password);

    // Return tokens in the response body
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      message: 'SignUp success',
    };
  }

  /**
   * 로컬 로그인
   */
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const tokens = await this.authService.signIn(email, password);

    // Return tokens in the response body
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      message: 'Login success',
    };
  }

  /**
   * 토큰 재발급
   */
  @Post('refresh')
  async refresh(
    @Body('userId') userId: number,
    @Body('refreshToken') rt: string,
  ) {
    const tokens = await this.authService.refreshTokens(userId, rt);

    // Return new tokens in the response body
    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      message: 'Tokens refreshed',
    };
  }

  /**
   * JWT 보호 라우트 예시
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
