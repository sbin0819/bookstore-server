// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service'; // Ensure correct import path

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  /**
   * Google OAuth 로그인 로직
   * Generates an access token for the authenticated Google user.
   */
  async loginWithGoogle(user: any) {
    // Ensure that 'user' includes the 'id' from the database, not 'googleId'
    // This typically involves finding or creating the user in the database first
    const existingUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    let userId: number;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // If user does not exist, create one
      const newUser = await this.prisma.user.create({
        data: {
          username: user.displayName || user.email, // Adjust as needed
          email: user.email,
          // You might want to set a default password or handle it differently
          password: '', // Or use a random string, depending on your requirements
        },
      });
      userId = newUser.id;
    }

    const payload = { email: user.email, sub: userId };
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Fallback to '1h' if not set
    });

    // Optionally, you can also generate a refresh token here
    // const refresh_token = this.jwtService.sign(payload, {
    //   secret: process.env.JWT_REFRESH_SECRET,
    //   expiresIn: '7d',
    // });

    return { access_token /*, refresh_token */ };
  }

  /**
   * JWT Strategy용 Validate 로직
   * Validates the JWT payload and retrieves the user.
   */
  async validateUserByJwt(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub }, // Ensure 'sub' is user.id
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { userId: user.id, email: user.email };
  }

  /**
   * 로컬 회원가입
   * - 이메일 및 유저명 중복 여부 확인
   * - 비밀번호 해싱 후 DB에 유저 저장
   * - Access/Refresh Token 발급 후 반환
   */
  async signUp(username: string, email: string, password: string) {
    // 1) 유저명(username) 중복 체크
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

    // 4) DB에 유저 생성
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
   * - 비밀번호 검증
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
      expiresIn: '1h', // Access token valid for 1 hour
    });

    const refresh_token = this.jwtService.sign(refreshTokenPayload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d', // Refresh token valid for 7 days
    });

    return { access_token, refresh_token };
  }

  /**
   * Refresh Token을 DB에 저장
   */
  async updateRefreshToken(userId: number, refreshToken: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  /**
   * Refresh Token을 DB에서 검증하고 새로운 토큰을 발급
   */
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      const tokens = await this.generateTokens(user.id, user.email);
      await this.updateRefreshToken(user.id, tokens.refresh_token);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('리프레시 토큰이 유효하지 않습니다.');
    }
  }
}
