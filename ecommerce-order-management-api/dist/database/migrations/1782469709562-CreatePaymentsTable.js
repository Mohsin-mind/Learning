"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePaymentsTable1782469709562 = void 0;
const typeorm_1 = require("typeorm");
class CreatePaymentsTable1782469709562 {
    name = 'CreatePaymentsTable1782469709562';
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'payments',
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
                    name: 'orderId',
                    type: 'varchar',
                },
                {
                    name: 'amount',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                },
                {
                    name: 'status',
                    type: 'enum',
                    enum: ['pending', 'completed', 'failed'],
                    enumName: 'payment_status_enum',
                    default: `'pending'`,
                },
                {
                    name: 'provider',
                    type: 'enum',
                    enum: ['stripe'],
                    enumName: 'payment_provider_enum',
                },
                {
                    name: 'transactionId',
                    type: 'varchar',
                    isNullable: true,
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
        await queryRunner.dropTable('payments');
    }
}
exports.CreatePaymentsTable1782469709562 = CreatePaymentsTable1782469709562;
//# sourceMappingURL=1782469709562-CreatePaymentsTable.js.map