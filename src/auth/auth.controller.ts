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
   * 쿠키 설정 유틸 함수
   */
  private setAuthCookies(
    res: Response,
    access_token: string,
    refresh_token: string | null = null,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: isProduction, // 프로덕션에서는 true, 개발에서는 false
      sameSite: isProduction ? 'none' : 'lax', // 프로덕션에서는 'none', 개발에서는 'lax'
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/', // 필요 시 경로 설정
      domain: isProduction ? 'bookstore-mu-blond.vercel.app' : undefined, // 필요 시 도메인 설정
    });

    if (refresh_token) {
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true, // 보안을 위해 true로 설정
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/', // 필요 시 경로 설정
        domain: isProduction ? 'bookstore-mu-blond.vercel.app' : undefined, // 필요 시 도메인 설정
      });
    }
  }

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
    const jwt = await this.authService.loginWithGoogle(user);
    // Access token만 쿠키에 저장 (여기서는 refresh token 생략 가정)
    this.setAuthCookies(res, jwt.access_token);

    return res.redirect(process.env.CLIENT_CALLBACK_URL);
  }

  /**
   * 로컬 회원가입
   */
  @Post('signup')
  async signUp(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    const tokens = await this.authService.signUp(username, email, password);
    this.setAuthCookies(res, tokens.access_token, tokens.refresh_token);

    return res.send({ message: 'SignUp success' });
  }

  /**
   * 로컬 로그인
   */
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    const tokens = await this.authService.signIn(email, password);
    this.setAuthCookies(res, tokens.access_token, tokens.refresh_token);

    return res.send({ message: 'Login success' });
  }

  /**
   * 토큰 재발급
   */
  @Post('refresh')
  async refresh(
    @Body('userId') userId: number,
    @Body('refreshToken') rt: string,
    @Res() res: Response,
  ) {
    const tokens = await this.authService.refreshTokens(userId, rt);
    this.setAuthCookies(res, tokens.access_token, tokens.refresh_token);

    return res.send({ message: 'Tokens refreshed' });
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
