import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateFilesTable1782469621598 implements MigrationInterface {
  name = 'CreateFilesTable1782469621598';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'files',
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
            name: 'originalName',
            type: 'varchar',
          },
          {
            name: 'mimeType',
            type: 'varchar',
          },
          {
            name: 'size',
            type: 'int',
          },
          {
            name: 'path',
            type: 'varchar',
          },
          {
            name: 'userId',
            type: 'varchar',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('files');
  }
}
