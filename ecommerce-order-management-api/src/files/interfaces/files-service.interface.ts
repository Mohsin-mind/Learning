import { FileRecord } from '../entities/file.entity';

export interface IFilesService {
  upload(file: Express.Multer.File, userId: string): Promise<FileRecord>;
  findById(id: string): Promise<FileRecord | null>;
}

export const FILES_SERVICE_TOKEN = Symbol('FILES_SERVICE_TOKEN');
