import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type {
  AccessToken,
  IJwtPayload,
  RefreshToken,
  UserRole,
} from '../types';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../dtos';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject('REDIS') private readonly redisClient: Redis,
  ) {}

  async validateCredentials(email: string, password: string) {
    const user = await this.usersService.getByEmailForAuth(email);
    if (!user) throw new UnauthorizedException('invalid credentials');
    const isPassMatch = await argon2.verify(user.password, password);
    if (!isPassMatch) throw new UnauthorizedException('invalid credentials');
    return user;
  }

  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    const payload: IJwtPayload = { sub: user.id, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessTokens(payload),
      this.generateRefreshTokens(payload),
    ]);
    await this.usersService.setRefreshTokens(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async login(user: { id: string; role: UserRole }) {
    const payload: IJwtPayload = { sub: user.id, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessTokens(payload),
      this.generateRefreshTokens(payload),
    ]);
    await this.usersService.setRefreshTokens(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async logout(userId: string, accessToken: AccessToken) {
    // decode access tokens
    const decodedTokens: { jti: string } = this.jwtService.decode(accessToken, {
      json: true,
    });
    if (!decodedTokens?.jti) {
      throw new UnauthorizedException('Invalid access token');
    }

    // set tokens to black list
    await this.redisClient.set(
      `tid:${decodedTokens.jti}`,
      decodedTokens.jti,
      'EX',
      60 * 10,
    );
    await this.usersService.removeRefreshTokens(userId);
  }

  async refresh(user: {
    id: string;
    role: UserRole;
    refreshToken: RefreshToken;
  }) {
    const payload: IJwtPayload = {
      sub: user.id,
      role: user.role,
    };
    const userFromDB = await this.usersService.getByIdForAuth(user.id);
    const plainRefreshToken = user.refreshToken;
    const hashedRefreshToken = userFromDB.refreshToken as string;
    const isRefreshTokenMatch = await argon2.verify(
      hashedRefreshToken,
      plainRefreshToken,
    );
    if (!isRefreshTokenMatch)
      throw new UnauthorizedException('invalid credentials');
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessTokens(payload),
      this.generateRefreshTokens(payload),
    ]);
    await this.usersService.setRefreshTokens(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async generateAccessTokens(payload: IJwtPayload): Promise<AccessToken> {
    const tokenId = randomUUID();
    return await this.jwtService.signAsync(
      { jti: tokenId, ...payload },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.getOrThrow('JWT_ACCESS_EXPIRY'),
      },
    );
  }

  async generateRefreshTokens(payload: IJwtPayload): Promise<RefreshToken> {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRY'),
    });
  }
}
