import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTsvectorSearchToProducts1798000000000 implements MigrationInterface {
  name = 'AddTsvectorSearchToProducts1798000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE products
      ADD COLUMN search_vector tsvector
      GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B')
      ) STORED;
    `);

    await queryRunner.query(`
      CREATE INDEX idx_products_search_vector
      ON products
      USING GIN (search_vector);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_search_vector`);
    await queryRunner.query(`ALTER TABLE products DROP COLUMN IF EXISTS search_vector`);
  }
}
