import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileRepository } from './file.repository';
import { FILES_SERVICE_TOKEN } from './interfaces/files-service.interface';

@Module({
  controllers: [FilesController],
  providers: [
    {
      provide: FILES_SERVICE_TOKEN,
      useClass: FilesService,
    },
    FileRepository,
  ],
  exports: [FILES_SERVICE_TOKEN, FileRepository],
})
export class FilesModule {}
