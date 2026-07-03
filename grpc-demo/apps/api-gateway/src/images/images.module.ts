import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'IMAGE_SERVICE',
        transport: Transport.GRPC,
        options: {
          url: '0.0.0.0:5000',
          package: 'image',
          protoPath: join(process.cwd(), 'proto/image.proto'),
        },
      },
    ]),
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}
