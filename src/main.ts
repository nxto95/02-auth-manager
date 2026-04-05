import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { BlackListedTokensGuard } from './auth/guards';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalGuards(app.get(BlackListedTokensGuard));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() =>
    console.log('🌷 App is running successfully on port:', process.env.PORT),
  )
  .catch((error) => console.error(error));
