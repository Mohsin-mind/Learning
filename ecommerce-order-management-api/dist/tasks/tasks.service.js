"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TasksService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("typeorm");
const order_repository_1 = require("../orders/order.repository");
const order_entity_1 = require("../orders/entities/order.entity");
let TasksService = TasksService_1 = class TasksService {
    orderRepository;
    logger = new common_1.Logger(TasksService_1.name);
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async cleanStaleOrders() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const staleOrders = await this.orderRepository.find({
            where: {
                status: order_entity_1.OrderStatus.CANCELLED,
                createdAt: (0, typeorm_1.LessThan)(thirtyDaysAgo),
            },
        });
        if (staleOrders.length > 0) {
            await this.orderRepository.remove(staleOrders);
            this.logger.log(`Cleaned ${staleOrders.length} stale cancelled orders`);
        }
    }
};
exports.TasksService = TasksService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "cleanStaleOrders", null);
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof order_repository_1.OrderRepository !== "undefined" && order_repository_1.OrderRepository) === "function" ? _a : Object])
], TasksService);
//# sourceMappingURL=tasks.service.js.map