// strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extract from Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Fallback: Extract from cookies
        (req: Request) => {
          if (req && req.cookies) {
            return req.cookies['access_token'];
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Called automatically after JWT is validated
   */
  async validate(payload: any) {
    const user = await this.authService.validateUserByJwt(payload);
    if (!user) {
      throw new UnauthorizedException('Access Denied: Invalid Token');
    }
    return user; // Injected into request.user
  }
}
