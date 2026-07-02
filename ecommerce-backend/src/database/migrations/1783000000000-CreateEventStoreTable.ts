import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateEventStoreTable1783000000000 implements MigrationInterface {
  name = 'CreateEventStoreTable1783000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'event_store',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'aggregate_id',
            type: 'uuid',
          },
          {
            name: 'aggregate_type',
            type: 'varchar',
          },
          {
            name: 'event_type',
            type: 'varchar',
          },
          {
            name: 'payload',
            type: 'jsonb',
          },
          {
            name: 'version',
            type: 'int',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'event_store',
      new TableIndex({
        name: 'IDX_event_store_aggregate_version',
        columnNames: ['aggregate_id', 'version'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('event_store');
  }
}
