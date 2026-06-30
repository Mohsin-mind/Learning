import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
export declare class OrderEventsProcessor extends WorkerHost {
    private readonly logger;
    process(job: Job): Promise<void>;
    private handleOrderCreated;
    private handleOrderFailed;
    private handlePaymentProcessed;
    onCompleted(job: Job): void;
    onFailed(job: Job, error: Error): void;
}
