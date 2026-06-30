import { FileRecord } from '../entities/file.entity';
export interface IFilesService {
    upload(file: Express.Multer.File, userId: string): Promise<FileRecord>;
    findById(id: string): Promise<FileRecord | null>;
}
export declare const FILES_SERVICE_TOKEN: unique symbol;
