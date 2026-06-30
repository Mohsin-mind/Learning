"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrdersAndOrderItemsTables1762000000000 = void 0;
const typeorm_1 = require("typeorm");
class CreateOrdersAndOrderItemsTables1762000000000 {
    name = 'CreateOrdersAndOrderItemsTables1762000000000';
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'orders',
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
                    name: 'userId',
                    type: 'uuid',
                },
                {
                    name: 'status',
                    type: 'enum',
                    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
                    enumName: 'orders_status_enum',
                    default: `'pending'`,
                },
                {
                    name: 'total',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
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
        await queryRunner.createForeignKey('orders', new typeorm_1.TableForeignKey({
            columnNames: ['userId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
        }));
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'order_items',
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
                    type: 'uuid',
                },
                {
                    name: 'productId',
                    type: 'uuid',
                },
                {
                    name: 'productName',
                    type: 'varchar',
                },
                {
                    name: 'price',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                },
                {
                    name: 'quantity',
                    type: 'int',
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'now()',
                },
            ],
        }), true);
        await queryRunner.createForeignKey('order_items', new typeorm_1.TableForeignKey({
            columnNames: ['orderId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'orders',
            onDelete: 'CASCADE',
        }));
    }
    async down(queryRunner) {
        const orderItemsTable = await queryRunner.getTable('order_items');
        const orderItemsFk = orderItemsTable.foreignKeys.find((fk) => fk.columnNames.indexOf('orderId') !== -1);
        if (orderItemsFk) {
            await queryRunner.dropForeignKey('order_items', orderItemsFk);
        }
        await queryRunner.dropTable('order_items');
        const ordersTable = await queryRunner.getTable('orders');
        const ordersFk = ordersTable.foreignKeys.find((fk) => fk.columnNames.indexOf('userId') !== -1);
        if (ordersFk) {
            await queryRunner.dropForeignKey('orders', ordersFk);
        }
        await queryRunner.dropTable('orders');
    }
}
exports.CreateOrdersAndOrderItemsTables1762000000000 = CreateOrdersAndOrderItemsTables1762000000000;
//# sourceMappingURL=1762000000000-CreateOrdersAndOrderItemsTables.js.map