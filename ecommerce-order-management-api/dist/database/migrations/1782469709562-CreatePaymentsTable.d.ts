import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreatePaymentsTable1782469709562 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
