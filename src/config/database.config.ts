import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const isDev = process.env.NODE_ENV === 'development';
  return {
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    autoLoadEntities: true,
    entities: [User],
    synchronize: isDev,
    logging: true,
  };
});
