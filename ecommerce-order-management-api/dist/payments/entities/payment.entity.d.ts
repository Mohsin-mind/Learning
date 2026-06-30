export declare enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum PaymentProvider {
    STRIPE = "stripe"
}
export declare class Payment {
    id: string;
    orderId: string;
    amount: number;
    status: PaymentStatus;
    provider: PaymentProvider;
    transactionId: string;
    createdAt: Date;
    updatedAt: Date;
}
