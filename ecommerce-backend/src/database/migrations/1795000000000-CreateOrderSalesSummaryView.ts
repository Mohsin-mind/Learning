import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrderSalesSummaryView1795000000000 implements MigrationInterface {
  name = 'CreateOrderSalesSummaryView1795000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW order_sales_summary AS
      SELECT
        DATE(o."createdAt") AS "orderDate",
        COUNT(*)::int AS "totalOrders",
        CAST(SUM(o.total) AS numeric(10,2)) AS "totalRevenue",
        CAST(AVG(o.total) AS numeric(10,2)) AS "avgOrderValue"
      FROM orders o
      WHERE o.status != 'cancelled'
      GROUP BY DATE(o."createdAt")
      ORDER BY DATE(o."createdAt") DESC
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_order_sales_summary_date ON order_sales_summary ("orderDate")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS order_sales_summary`);
  }
}
