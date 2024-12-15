// auth.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 구글 OAuth 로그인 진입점
   * - GET /auth/google
   * - 구글 로그인 페이지로 리다이렉트
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Passport가 알아서 Google 로그인 페이지로 Redirect
  }

  /**
   * 구글 OAuth에서 돌아오는 콜백 URL
   * - GET /auth/google/callback
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any) {
    // 구글 OAuth를 통해 인증된 user 정보는 req.user로 들어옴
    const { user } = req;
    const jwt = await this.authService.loginWithGoogle(user);
    return {
      message: 'Google OAuth 로그인 성공',
      user,
      ...jwt, // { access_token: ... }
    };
  }

  /**
   * 보호된 라우트 예시: JWT 토큰 필요
   * - GET /auth/profile
   */
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: any) {
    return {
      message: '인증된 유저만 볼 수 있는 프로필 정보',
      user: req.user,
    };
  }
}
