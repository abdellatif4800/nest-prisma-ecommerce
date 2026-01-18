import { NestFactory } from '@nestjs/core';
import { AdminApiModule } from './admin-api.module';
import { ConsoleLogger, ValidationPipe, Logger } from '@nestjs/common';
import { AuthGuard, RoleGuard } from 'apiLibs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { log } from 'node:console';

async function bootstrap() {
  const app = await NestFactory.create(AdminApiModule, {
    logger: new ConsoleLogger({
      json: true,
      colors: true,
    }),
  });
  app.enableCors();

  // ---------------
  // const globalPrefix = 'adminApi';
  // app.setGlobalPrefix(globalPrefix);

  // ---------------
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ---------------
  const port = process.env.ADMIN_PORT!;

  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port} `);
}
bootstrap();
