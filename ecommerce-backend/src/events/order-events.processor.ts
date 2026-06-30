import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES, ORDER_JOBS, WORKER_EVENTS } from '../common/constants/app.constants';

@Processor(QUEUES.ORDERS)
export class OrderEventsProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderEventsProcessor.name);

  // eslint-disable-next-line @typescript-eslint/require-await
  async process(job: Job): Promise<void> {
    switch (job.name) {
      case ORDER_JOBS.CREATED:
        this.handleOrderCreated(job.data as OrderCreatedPayload);
        break;

      case ORDER_JOBS.FAILED:
        this.handleOrderFailed(job.data as OrderFailedPayload);
        break;

      case ORDER_JOBS.PAYMENT_PROCESSED:
        this.handlePaymentProcessed(job.data as PaymentProcessedPayload);
        break;

      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private handleOrderCreated(payload: OrderCreatedPayload): void {
    this.logger.log(
      `[EMAIL] Order confirmation sent to user ${payload.userId} — ` +
        `order #${payload.orderId} (${payload.itemCount} items, $${payload.total})`,
    );
  }

  private handleOrderFailed(payload: OrderFailedPayload): void {
    this.logger.warn(
      `[EMAIL] Order failure notification sent to user ${payload.userId} — reason: ${payload.reason}`,
    );
  }

  private handlePaymentProcessed(payload: PaymentProcessedPayload): void {
    if (payload.success) {
      this.logger.log(
        `[EMAIL] Payment receipt sent for order #${payload.orderId} (payment: ${payload.paymentId})`,
      );
    } else {
      this.logger.warn(
        `[EMAIL] Payment failure alert sent for order #${payload.orderId} — order has been cancelled`,
      );
    }
  }

  @OnWorkerEvent(WORKER_EVENTS.COMPLETED)
  onCompleted(job: Job): void {
    this.logger.log(`Job completed: ${job.name} [id=${job.id}]`);
  }

  @OnWorkerEvent(WORKER_EVENTS.FAILED)
  onFailed(job: Job, error: Error): void {
    this.logger.error(`Job failed: ${job.name} [id=${job.id}] — ${error.message}`);
  }
}

interface OrderCreatedPayload {
  orderId: string;
  userId: string;
  total: number;
  itemCount: number;
}

interface OrderFailedPayload {
  userId: string;
  reason: string;
}

interface PaymentProcessedPayload {
  orderId: string;
  paymentId: string;
  success: boolean;
}
