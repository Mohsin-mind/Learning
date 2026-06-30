"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUsersTable1760000000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateUsersTable1760000000000 {
    name = 'CreateUsersTable1760000000000';
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'users',
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
                    name: 'email',
                    type: 'varchar',
                    isUnique: true,
                },
                {
                    name: 'password',
                    type: 'varchar',
                },
                {
                    name: 'name',
                    type: 'varchar',
                },
                {
                    name: 'role',
                    type: 'enum',
                    enum: ['user', 'admin'],
                    enumName: 'user_role_enum',
                    default: `'user'`,
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
            ],
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('users');
    }
}
exports.CreateUsersTable1760000000000 = CreateUsersTable1760000000000;
//# sourceMappingURL=1760000000000-CreateUsersTable.js.map