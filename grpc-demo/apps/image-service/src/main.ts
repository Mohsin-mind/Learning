import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ImageServiceModule } from './image-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ImageServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        url: '0.0.0.0:5000',
        package: 'image',
        protoPath: join(process.cwd(), 'proto/image.proto'),
      },
    },
  );

  await app.listen();
  console.log('[image-service] gRPC service listening on port 5000');
}
bootstrap();
