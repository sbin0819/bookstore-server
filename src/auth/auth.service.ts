// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service'; // PrismaService 주입

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  /**
   * Google OAuth 로그인 로직 (기존)
   */
  async loginWithGoogle(user: any) {
    const payload = { email: user.email, sub: user.googleId };
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    return { access_token };
  }

  /**
   * JWT Strategy용 Validate 로직 (기존)
   */
  async validateUserByJwt(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }

  /**
   * 로컬 회원가입
   * - 이메일 중복 여부 확인
   * - 비밀번호 해싱(bcrypt) 후 DB 저장
   * - Access/Refresh Token 발급 후 반환
   */
  async signUp(username: string, email: string, password: string) {
    // 1) 유저명(username) 중복 여부도 함께 체크해줄 수 있음
    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw new UnauthorizedException('이미 존재하는 username입니다.');
    }

    // 2) 이메일 중복 체크
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('이미 존재하는 이메일입니다.');
    }

    // 3) 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4) DB에 유저 생성 (username 필드 포함)
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // 5) Access/Refresh Token 발급
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  /**
   * 로컬 로그인
   * - 이메일로 사용자 조회
   * - bcrypt로 비밀번호 검증
   * - Access/Refresh Token 발급 후 반환
   */
  async signIn(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('이메일 혹은 비밀번호가 잘못되었습니다.');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('이메일 혹은 비밀번호가 잘못되었습니다.');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    // DB에 Refresh Token 저장
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  /**
   * Access Token, Refresh Token 동시 발급
   */
  async generateTokens(userId: number, email: string) {
    const accessTokenPayload = { sub: userId, email };
    const refreshTokenPayload = { sub: userId, email };

    const access_token = this.jwtService.sign(accessTokenPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h', // ex) '1h'
    });

    const refresh_token = this.jwtService.sign(refreshTokenPayload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d', // ex) '7d'
    });

    return { access_token, refresh_token };
  }

  /**
   * Refresh Token을 DB에 저장 (옵션)
   */
  async updateRefreshToken(userId: number, refreshToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  /**
   * Refresh Token 검증 후 새로운 Access/Refresh Token 발급
   */
  async refreshTokens(userId: number, rtFromClient: string) {
    // DB에서 유저의 refreshToken 가져옴
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('리프레시 토큰이 없습니다.');

    // 일치 여부 확인
    if (user.refreshToken !== rtFromClient) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    // 토큰 재발급
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }
}
