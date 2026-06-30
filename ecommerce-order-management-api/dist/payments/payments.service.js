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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const payment_entity_1 = require("./entities/payment.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const payment_repository_1 = require("./payment.repository");
const order_repository_1 = require("../orders/order.repository");
const app_constants_1 = require("../common/constants/app.constants");
let PaymentsService = class PaymentsService {
    paymentRepository;
    orderRepository;
    orderQueue;
    constructor(paymentRepository, orderRepository, orderQueue) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.orderQueue = orderQueue;
    }
    async handleWebhook(payload) {
        const order = await this.orderRepository.findOne({ where: { id: payload.orderId } });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        order.status = payload.success ? order_entity_1.OrderStatus.CONFIRMED : order_entity_1.OrderStatus.CANCELLED;
        await this.orderRepository.save(order);
        const payment = this.paymentRepository.create({
            orderId: payload.orderId,
            amount: payload.amount,
            status: payload.success ? payment_entity_1.PaymentStatus.COMPLETED : payment_entity_1.PaymentStatus.FAILED,
            provider: payment_entity_1.PaymentProvider.STRIPE,
            transactionId: payload.transactionId,
        });
        const savedPayment = await this.paymentRepository.save(payment);
        await this.orderQueue.add(app_constants_1.ORDER_JOBS.PAYMENT_PROCESSED, {
            orderId: payload.orderId,
            paymentId: savedPayment.id,
            success: payload.success,
        });
        return savedPayment;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)(app_constants_1.QUEUES.ORDERS)),
    __metadata("design:paramtypes", [typeof (_a = typeof payment_repository_1.PaymentRepository !== "undefined" && payment_repository_1.PaymentRepository) === "function" ? _a : Object, typeof (_b = typeof order_repository_1.OrderRepository !== "undefined" && order_repository_1.OrderRepository) === "function" ? _b : Object, typeof (_c = typeof bullmq_2.Queue !== "undefined" && bullmq_2.Queue) === "function" ? _c : Object])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map