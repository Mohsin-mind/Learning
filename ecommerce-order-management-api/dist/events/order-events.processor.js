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
var OrderEventsProcessor_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderEventsProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const bullmq_2 = require("bullmq");
const app_constants_1 = require("../common/constants/app.constants");
let OrderEventsProcessor = OrderEventsProcessor_1 = class OrderEventsProcessor extends bullmq_1.WorkerHost {
    logger = new common_1.Logger(OrderEventsProcessor_1.name);
    async process(job) {
        switch (job.name) {
            case app_constants_1.ORDER_JOBS.CREATED:
                this.handleOrderCreated(job.data);
                break;
            case app_constants_1.ORDER_JOBS.FAILED:
                this.handleOrderFailed(job.data);
                break;
            case app_constants_1.ORDER_JOBS.PAYMENT_PROCESSED:
                this.handlePaymentProcessed(job.data);
                break;
            default:
                this.logger.warn(`Unknown job name: ${job.name}`);
        }
    }
    handleOrderCreated(payload) {
        this.logger.log(`[EMAIL] Order confirmation sent to user ${payload.userId} — ` +
            `order #${payload.orderId} (${payload.itemCount} items, $${payload.total})`);
    }
    handleOrderFailed(payload) {
        this.logger.warn(`[EMAIL] Order failure notification sent to user ${payload.userId} — reason: ${payload.reason}`);
    }
    handlePaymentProcessed(payload) {
        if (payload.success) {
            this.logger.log(`[EMAIL] Payment receipt sent for order #${payload.orderId} (payment: ${payload.paymentId})`);
        }
        else {
            this.logger.warn(`[EMAIL] Payment failure alert sent for order #${payload.orderId} — order has been cancelled`);
        }
    }
    onCompleted(job) {
        this.logger.log(`Job completed: ${job.name} [id=${job.id}]`);
    }
    onFailed(job, error) {
        this.logger.error(`Job failed: ${job.name} [id=${job.id}] — ${error.message}`);
    }
};
exports.OrderEventsProcessor = OrderEventsProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)(app_constants_1.WORKER_EVENTS.COMPLETED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof bullmq_2.Job !== "undefined" && bullmq_2.Job) === "function" ? _a : Object]),
    __metadata("design:returntype", void 0)
], OrderEventsProcessor.prototype, "onCompleted", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)(app_constants_1.WORKER_EVENTS.FAILED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof bullmq_2.Job !== "undefined" && bullmq_2.Job) === "function" ? _b : Object, Error]),
    __metadata("design:returntype", void 0)
], OrderEventsProcessor.prototype, "onFailed", null);
exports.OrderEventsProcessor = OrderEventsProcessor = OrderEventsProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(app_constants_1.QUEUES.ORDERS)
], OrderEventsProcessor);
//# sourceMappingURL=order-events.processor.js.map