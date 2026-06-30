import { DataSource, Repository } from 'typeorm';
import { FileRecord } from './entities/file.entity';
export declare class FileRepository extends Repository<FileRecord> {
    private readonly dataSource;
    constructor(dataSource: DataSource);
}
