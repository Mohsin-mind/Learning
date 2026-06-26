import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FileRecord } from './entities/file.entity';

@Injectable()
export class FileRepository extends Repository<FileRecord> {
  constructor(private readonly dataSource: DataSource) {
    super(FileRecord, dataSource.manager);
  }
}
