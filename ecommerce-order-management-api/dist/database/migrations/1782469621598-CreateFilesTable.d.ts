import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateFilesTable1782469621598 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
