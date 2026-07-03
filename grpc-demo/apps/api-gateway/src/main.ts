import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  await app.listen(3001);
  console.log('[api-gateway] REST service listening on http://localhost:3001');
}
bootstrap();
