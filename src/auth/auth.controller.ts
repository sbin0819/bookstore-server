// auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
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

    // AuthService를 통해 액세스 토큰 및 리프레시 토큰 생성
    const tokens = await this.authService.loginWithGoogle(user);

    // 리프레시 토큰을 HTTP-Only 쿠키로 설정
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 클라이언트로 액세스 토큰 전달 (URL 쿼리 매개변수)
    const CLIENT_CALLBACK_URL = process.env.CLIENT_CALLBACK_URL;
    const redirectUrl = `${CLIENT_CALLBACK_URL}/google/callback?access_token=${tokens.access_token}`;

    return res.redirect(redirectUrl);
  }
  /**
   * 로컬 회원가입
   */
  @Post('signup')
  async signUp(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response, // Allow setting cookies
  ) {
    const tokens = await this.authService.signUp(username, email, password);

    // Set refresh_token in HTTP-only cookie
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return access_token in response body
    return {
      access_token: tokens.access_token,
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
    @Res({ passthrough: true }) res: Response, // Allow setting cookies
  ) {
    const tokens = await this.authService.signIn(email, password);

    // Set refresh_token in HTTP-only cookie
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return access_token in response body
    return {
      access_token: tokens.access_token,
      message: 'Login success',
    };
  }

  /**
   * 토큰 재발급
   */
  @Post('refresh')
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 없습니다.');
    }

    const tokens = await this.authService.refreshTokens(refreshToken);

    // Optionally, update the refresh_token cookie
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return new access_token in response body
    return {
      access_token: tokens.access_token,
      message: 'Tokens refreshed',
    };
  }

  /**
   * Logout Endpoint
   */
  @Post('logout')
  async logout(@Res() res: Response) {
    // Clear the refresh_token cookie
    res.clearCookie('refresh_token');
    return res.json({ message: 'Logged out successfully' });
  }

  /**
   * JWT 보호 라우트 예시
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Req() req: any) {
    return {
      user: req.user,
    };
  }
}
