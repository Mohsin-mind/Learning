import type { IFilesService } from './interfaces/files-service.interface';
import { User } from '../users/entities/user.entity';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: IFilesService);
    upload(file: Express.Multer.File, user: User): any;
    findOne(id: string): any;
}
