import { FileRecord } from './entities/file.entity';
import { FileRepository } from './file.repository';
import { IFilesService } from './interfaces/files-service.interface';
export declare class FilesService implements IFilesService {
    private readonly fileRepository;
    constructor(fileRepository: FileRepository);
    upload(file: Express.Multer.File, userId: string): Promise<FileRecord>;
    findById(id: string): Promise<FileRecord | null>;
}
