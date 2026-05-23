import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { resolveAllowedCorsMethods } from '@middleware/core/config/cors.util';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@middleware/core/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);
  app.useLogger(logger);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(cookieParser(configService.get<string>('COOKIES_SECRET')));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const allowedOrigins = JSON.parse(
    configService.get<string>('ALLOWED_ORIGINS') || '[]',
  );
  const allowedMethods = resolveAllowedCorsMethods(
    configService.get<string>('NODE_ENV'),
    configService.get<string>('ALLOWED_METHODS'),
  );

  app.enableCors({
    origin: allowedOrigins,
    methods: allowedMethods,
    credentials: true,
  });

  app.disable('x-powered-by');

  app.setGlobalPrefix('api');

  const port = configService.get<number>('PORT') ?? 3001;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}

bootstrap();
