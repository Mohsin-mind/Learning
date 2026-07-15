import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DashboardNote } from './entities/dashboard-note.entity';

@Injectable()
export class DashboardNoteRepository extends Repository<DashboardNote> {
  constructor(private readonly dataSource: DataSource) {
    super(DashboardNote, dataSource.manager);
  }
}
