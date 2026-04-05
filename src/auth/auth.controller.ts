import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { CreateUserDto } from '../dtos';
import { AccessToken, RefreshToken, UserRole } from '../types';
import { JwtAccessGuard, JwtRefreshGuard, LocalAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // register
  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    const { accessToken, refreshToken } = await this.authService.register(dto);
    return {
      message: 'user registered successfully',
      data: {
        accessToken,
        refreshToken,
      },
    };
  }
  // login

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@CurrentUser() user: { id: string; role: UserRole }) {
    const { accessToken, refreshToken } = await this.authService.login(user);
    return {
      message: 'user logged in successfully',
      data: {
        accessToken,
        refreshToken,
      },
    };
  }
  // logout
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessGuard)
  async logout(@CurrentUser() user: { id: string; accessToken: AccessToken }) {
    await this.authService.logout(user.id, user.accessToken);
    return {
      message: 'user logged out successfully',
    };
  }
  // refresh
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @CurrentUser()
    user: {
      id: string;
      role: UserRole;
      refreshToken: RefreshToken;
    },
  ) {
    const { accessToken, refreshToken } = await this.authService.refresh(user);
    return {
      message: 'user tokens refreshed successfully',
      data: {
        accessToken,
        refreshToken,
      },
    };
  }
}
