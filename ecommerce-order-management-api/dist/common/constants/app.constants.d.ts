export declare const REGEX: {
    readonly PASSWORD: RegExp;
};
export declare const QUEUES: {
    readonly ORDERS: "orders";
};
export declare const ORDER_JOBS: {
    readonly CREATED: "order.created";
    readonly FAILED: "order.failed";
    readonly PAYMENT_PROCESSED: "payment.processed";
};
export declare const WORKER_EVENTS: {
    readonly COMPLETED: "completed";
    readonly FAILED: "failed";
};
