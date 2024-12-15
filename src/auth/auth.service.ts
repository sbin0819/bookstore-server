// auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async loginWithGoogle(user: any) {
    const payload = { email: user.email, sub: user.googleId };
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET, // Ensure this matches JwtStrategy
      expiresIn: '1h',
    });
    return { access_token };
  }

  async validateUserByJwt(payload: any) {
    // Implement your user validation logic here
    // For example, check if user exists in the database
    // Return user object if valid, else return null
    return { userId: payload.sub, email: payload.email };
  }
}
