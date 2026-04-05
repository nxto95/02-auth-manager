import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../dtos';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAll() {
    const [users, count] = await this.usersService.getAll();
    return {
      message: 'Users listed successfully',
      meta: {
        totalItems: count,
      },
      data: users,
    };
  }

  @Get(':userId')
  async getById(@Param('userId', ParseUUIDPipe) userId: string) {
    const user = await this.usersService.getById(userId);
    return {
      message: 'User listed successfully',
      data: user,
    };
  }

  @Delete(':userId')
  async delete(@Param('userId', ParseUUIDPipe) userId: string) {
    await this.usersService.delete(userId);
    return {
      message: 'User deleted successfully',
      data: userId,
    };
  }

  @Patch(':userId')
  async update(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    await this.usersService.update(userId, dto);
    return {
      message: 'User updated successfully',
      data: {
        userId,
        dto,
      },
    };
  }
}
