import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { appConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'health/live', 'health/ready'],
  });

  // Swagger must be registered BEFORE Helmet so its static assets
  // are served without Content-Security-Policy interference.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('E-commerce Order Management API')
    .setDescription('NestJS learning project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Helmet's default CSP includes `upgrade-insecure-requests` which
  // forces the browser to load Swagger's JS/CSS over HTTPS, breaking
  // the UI when running over plain HTTP.
  // contentSecurityPolicy is disabled here for dev convenience;
  // in production, configure an explicit CSP policy instead.
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();
  app.enableShutdownHooks();

  await app.listen(config.port);
}
void bootstrap();
