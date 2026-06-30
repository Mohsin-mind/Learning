"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFilesTable1782469621598 = void 0;
const typeorm_1 = require("typeorm");
class CreateFilesTable1782469621598 {
    name = 'CreateFilesTable1782469621598';
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
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
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('files');
    }
}
exports.CreateFilesTable1782469621598 = CreateFilesTable1782469621598;
//# sourceMappingURL=1782469621598-CreateFilesTable.js.map