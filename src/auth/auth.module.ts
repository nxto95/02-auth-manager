import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

import {
  JwtAccessStrategy,
  JwtRefreshStrategy,
  LocalStrategy,
} from './strategies';
import { RedisModule } from '../redis/redis.module';
import { BlackListedTokensGuard } from './guards/blacklisted.guard';

@Module({
  imports: [UsersModule, PassportModule, JwtModule, RedisModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    BlackListedTokensGuard,
  ],
  exports: [BlackListedTokensGuard],
})
export class AuthModule {}
