// auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * 구글 OAuth로부터 받은 유저 정보로 JWT 생성
   */
  async loginWithGoogle(user: any): Promise<{ access_token: string }> {
    const payload = { sub: user.providerId, email: user.email };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }

  /**
   * JWT 스트래티지에서 사용하는 유저 유효성 확인 로직(예시)
   */
  async validateUserByJwt(payload: any): Promise<any> {
    // payload.sub가 user.providerId라고 가정
    // 일반적으로 DB에서 user를 찾고, 존재하면 return
    // 없으면 null
    // 여기서는 예시로 아무 검증 없이 바로 user 객체를 반환한다고 가정
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
