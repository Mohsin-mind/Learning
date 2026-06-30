"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductsTable1761000000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateProductsTable1761000000000 {
    name = 'CreateProductsTable1761000000000';
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'products',
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
                    name: 'name',
                    type: 'varchar',
                },
                {
                    name: 'description',
                    type: 'text',
                },
                {
                    name: 'price',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                },
                {
                    name: 'stock',
                    type: 'int',
                    default: 0,
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'now()',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'now()',
                },
                {
                    name: 'version',
                    type: 'int',
                    default: 1,
                },
                {
                    name: 'deletedAt',
                    type: 'timestamp',
                    isNullable: true,
                },
            ],
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('products');
    }
}
exports.CreateProductsTable1761000000000 = CreateProductsTable1761000000000;
//# sourceMappingURL=1761000000000-CreateProductsTable.js.map