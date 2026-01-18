import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { ConsoleLogger, ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule, {
    logger: new ConsoleLogger({
      json: true,
      colors: true,
    }),
    rawBody: true,
  });
  app.enableCors();

  // ---------------
  // const globalPrefix = 'api';
  // app.setGlobalPrefix(globalPrefix);

  // ---------------
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ---------------
  const port = process.env.PORT!;

  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
