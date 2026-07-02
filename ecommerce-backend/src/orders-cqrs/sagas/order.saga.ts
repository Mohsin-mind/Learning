import { Injectable, Logger } from '@nestjs/common';
import { Saga, ICommand, ofType } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OrderCreatedEvent } from '../events/order-created.event';
import { StockDeductedEvent } from '../events/stock-deducted.event';
import { PaymentFailedEvent } from '../events/payment-failed.event';
import { DeductStockCommand } from '../commands/deduct-stock.command';
import { QUEUES } from '@/common/constants/app.constants';

@Injectable()
export class OrderSaga {
  private readonly logger = new Logger(OrderSaga.name);

  constructor(@InjectQueue(QUEUES.ORDERS_CQRS) private readonly sagaQueue: Queue) {}

  @Saga()
  onOrderCreated = (events$: Observable<unknown>): Observable<ICommand> => {
    return events$.pipe(
      ofType(OrderCreatedEvent),
      map((event) => new DeductStockCommand(event.orderId, event.items)),
    );
  };

  @Saga()
  onStockDeducted = (events$: Observable<unknown>): Observable<ICommand> => {
    return events$.pipe(
      ofType(StockDeductedEvent),
      tap((event) => {
        this.sagaQueue
          .add('charge-payment', {
            orderId: event.orderId,
          })
          .catch((err) => this.logger.error('Failed to enqueue charge-payment', err));
      }),
      filter(() => false),
    );
  };

  @Saga()
  onPaymentFailed = (events$: Observable<unknown>): Observable<ICommand> => {
    return events$.pipe(
      ofType(PaymentFailedEvent),
      tap((event) => {
        this.sagaQueue
          .add('restore-stock', {
            orderId: event.orderId,
          })
          .catch((err) => this.logger.error('Failed to enqueue restore-stock', err));
      }),
      filter(() => false),
    );
  };
}
