import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from 'src/dtos';
import { User } from 'src/users/users.entity';
import {
  AccessToken,
  IJwtPayload,
  JwtRefreshUser,
  RefreshToken,
} from 'src/types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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

  async login(user: Partial<User>) {
    const payload: IJwtPayload = { sub: user.id!, role: user.role! };
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessTokens(payload),
      this.generateRefreshTokens(payload),
    ]);
    await this.usersService.setRefreshTokens(user.id!, refreshToken);
    return { accessToken, refreshToken };
  }

  async logout(userId: string) {
    await this.usersService.removeRefreshTokens(userId);
  }

  async refresh(user: JwtRefreshUser) {
    const payload: IJwtPayload = {
      sub: user.sub,
      role: user.role,
    };
    const userFromDB = await this.usersService.getByIdForAuth(user.sub);
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
    await this.usersService.setRefreshTokens(user.sub, refreshToken);
    return { accessToken, refreshToken };
  }

  async generateAccessTokens(payload: IJwtPayload): Promise<AccessToken> {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_ACCESS_EXPIRY'),
    });
  }

  async generateRefreshTokens(payload: IJwtPayload): Promise<RefreshToken> {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRY'),
    });
  }
}
