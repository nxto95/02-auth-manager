import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJwtPayload, JwtRefreshUser } from '../../types';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromBodyField('refreshToken'),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: IJwtPayload): JwtRefreshUser {
    const authHeader = req.get('authorization');
    const bodyToken = req.body?.refreshToken as string | undefined;
    let refreshToken: string | undefined;

    if (authHeader?.toLowerCase().startsWith('bearer ')) {
      refreshToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    } else if (bodyToken) {
      refreshToken = bodyToken;
    }

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    return { id: payload.sub, role: payload.role, refreshToken };
  }
}
