"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKER_EVENTS = exports.ORDER_JOBS = exports.QUEUES = exports.REGEX = void 0;
exports.REGEX = {
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
};
exports.QUEUES = {
    ORDERS: 'orders',
};
exports.ORDER_JOBS = {
    CREATED: 'order.created',
    FAILED: 'order.failed',
    PAYMENT_PROCESSED: 'payment.processed',
};
exports.WORKER_EVENTS = {
    COMPLETED: 'completed',
    FAILED: 'failed',
};
//# sourceMappingURL=app.constants.js.map