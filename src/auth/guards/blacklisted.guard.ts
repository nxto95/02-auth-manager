import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import Redis from 'ioredis';

@Injectable()
export class BlackListedTokensGuard implements CanActivate {
  constructor(
    @Inject('REDIS') private readonly redisClient: Redis,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const excludedPaths = ['/auth/login', '/auth/register', '/auth/refresh'];
    if (excludedPaths.includes(request.url)) return true;
    const authHeader = request.get('authorization');
    if (!authHeader)
      throw new UnauthorizedException('Missing Authorization header');

    const accessToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!accessToken) throw new UnauthorizedException('Invalid token format');

    const decodedTokens: any = this.jwtService.decode(accessToken, {
      json: true,
    });
    if (!decodedTokens?.jti)
      throw new UnauthorizedException('Invalid access token');

    const blackListedJti = await this.redisClient.get(
      `tid:${decodedTokens.jti}`,
    );
    if (blackListedJti) throw new UnauthorizedException('Access token revoked');

    return true;
  }
}
