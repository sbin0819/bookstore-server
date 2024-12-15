// strategies/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  /**
   * 구글 OAuth 로그인이 성공했을 때 자동으로 호출되는 메서드.
   * profile 정보 등을 활용해서 DB에서 유저 조회나 생성 가능.
   * done(null, userObject)의 형태로 결과를 넘겨주면 Passport가 request.user에 주입.
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      provider: 'google',
      providerId: profile.id,
      email: emails && emails[0].value,
      displayName: name?.givenName + ' ' + name?.familyName,
      photo: photos && photos[0].value,
      accessToken,
    };
    // 실제로는 DB에서 유저 조회 혹은 생성 로직 필요
    // const userInDB = await this.userService.findOrCreateUser(user);
    // done(null, userInDB);
    done(null, user);
  }
}
