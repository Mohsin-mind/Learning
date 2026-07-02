import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
import { ChargePaymentCommand } from '../commands/charge-payment.command';
import { RestoreStockCommand } from '../commands/restore-stock.command';
import { WORKER_EVENTS, QUEUES } from '@/common/constants/app.constants';
import { GetOrderQuery } from '../queries/get-order.query';

interface ChargePaymentPayload {
  orderId: string;
}

interface RestoreStockPayload {
  orderId: string;
}

@Injectable()
@Processor(QUEUES.ORDERS_CQRS)
export class ChargePaymentProcessor extends WorkerHost {
  private readonly logger = new Logger(ChargePaymentProcessor.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    super();
  }

  async process(job: Job<ChargePaymentPayload | RestoreStockPayload>): Promise<void> {
    if (job.name === 'charge-payment') {
      await this.chargePayment(job as Job<ChargePaymentPayload>);
      return;
    }

    if (job.name === 'restore-stock') {
      await this.restoreStock(job as Job<RestoreStockPayload>);
    }
  }

  private async chargePayment(job: Job<ChargePaymentPayload>): Promise<void> {
    const { orderId } = job.data;
    this.logger.log(`Charging payment for order ${orderId}`);

    const order = await this.queryBus.execute<GetOrderQuery, { total: number }>(
      new GetOrderQuery(orderId),
    );

    const command = new ChargePaymentCommand(orderId, order.total);
    await this.commandBus.execute(command);
  }

  private async restoreStock(job: Job<RestoreStockPayload>): Promise<void> {
    const { orderId } = job.data;
    this.logger.log(`Restoring stock for order ${orderId}`);

    const order = await this.queryBus.execute<
      GetOrderQuery,
      { items: { productId: string; quantity: number }[] }
    >(new GetOrderQuery(orderId));

    const command = new RestoreStockCommand(orderId, order.items);
    await this.commandBus.execute(command);
  }

  @OnWorkerEvent(WORKER_EVENTS.COMPLETED)
  onCompleted(job: Job): void {
    if (job.name !== 'charge-payment' && job.name !== 'restore-stock') return;
    this.logger.log(`${job.name} completed [id=${job.id}]`);
  }

  @OnWorkerEvent(WORKER_EVENTS.FAILED)
  onFailed(job: Job, error: Error): void {
    if (job.name !== 'charge-payment' && job.name !== 'restore-stock') return;
    this.logger.error(`${job.name} failed [id=${job.id}] — ${error.message}`);
  }
}
