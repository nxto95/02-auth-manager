import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryFailedError } from 'typeorm';
import { User } from './users.entity';
import * as argon2 from 'argon2';
import { CreateUserDto, UpdateUserDto } from 'src/dtos';

@Injectable()
export class UsersService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(dto: CreateUserDto) {
    try {
      const userObj = this.dataSource.manager.create(User, {
        username: dto.username,
        email: dto.email,
        password: await argon2.hash(dto.password),
      });
      return await this.dataSource.manager.save(User, userObj);
    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).code === '23505')
        if ((error as any).constraint === 'unique_email')
          throw new ConflictException(
            `user with this email [${dto.email}] already exist`,
          );
      if ((error as any).constraint === 'unique_username')
        throw new ConflictException(
          `user with this username [${dto.username}] already exist`,
        );

      throw error;
    }
  }

  async delete(userId: string) {
    const result = await this.dataSource
      .createQueryBuilder(User, 'user')
      .delete()
      .where('id = :userId', { userId })
      .execute();
    if (result.affected === 0)
      throw new NotFoundException(`user with this id ${userId} not exist`);
  }

  async update(userId: string, dto: UpdateUserDto) {
    try {
      const result = await this.dataSource
        .createQueryBuilder(User, 'user')
        .update()
        .set({ username: dto.username })
        .where('id = :userId', { userId })
        .execute();
      if (result.affected === 0)
        throw new NotFoundException(`user with this id ${userId} not exist`);
    } catch (error) {
      if (error instanceof QueryFailedError)
        if ((error as any).code === '23505')
          if ((error as any).constraint === 'unique_username')
            throw new ConflictException(
              `user with this username [${dto.username}] already exist`,
            );
    }
  }

  async getById(userId: string) {
    return await this.dataSource
      .createQueryBuilder(User, 'user')
      .select('user')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async getByEmailForAuth(email: string) {
    return await this.dataSource
      .createQueryBuilder(User, 'user')
      .select('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async getAll() {
    return await this.dataSource
      .createQueryBuilder(User, 'user')
      .select()
      .getManyAndCount();
  }

  async updateRefreshTokens() {}
  async verifyEmail() {}
  async verifyAccount() {}
}
