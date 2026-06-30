import { Injectable } from '@nestjs/common';
import { FileRecord } from './entities/file.entity';
import { FileRepository } from './file.repository';
import { IFilesService } from './interfaces/files-service.interface';

@Injectable()
export class FilesService implements IFilesService {
  constructor(private readonly fileRepository: FileRepository) {}

  async upload(file: Express.Multer.File, userId: string): Promise<FileRecord> {
    const fileRecord = this.fileRepository.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      userId,
    });

    return this.fileRepository.save(fileRecord);
  }

  async findById(id: string): Promise<FileRecord | null> {
    return this.fileRepository.findOne({ where: { id } });
  }
}
