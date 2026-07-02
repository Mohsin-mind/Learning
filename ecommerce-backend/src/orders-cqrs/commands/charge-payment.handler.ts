import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { ChargePaymentCommand } from './charge-payment.command';
import { PaymentChargedEvent } from '../events/payment-charged.event';
import { PaymentFailedEvent } from '../events/payment-failed.event';
import { EventStoreService } from '../event-store/event-store.service';

@Injectable()
@CommandHandler(ChargePaymentCommand)
export class ChargePaymentHandler implements ICommandHandler<ChargePaymentCommand> {
  private readonly logger = new Logger(ChargePaymentHandler.name);

  constructor(
    private readonly eventStore: EventStoreService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ChargePaymentCommand): Promise<void> {
    const { orderId, amount } = command;

    const success = true;

    if (success) {
      await this.eventStore.append(
        orderId,
        'Order',
        'PaymentCharged',
        {
          orderId,
          amount,
        },
      );

      this.logger.log(`Payment charged for order ${orderId} ($${amount})`);
      this.eventBus.publish(new PaymentChargedEvent(orderId, amount));
    } else {
      await this.eventStore.append(
        orderId,
        'Order',
        'PaymentFailed',
        {
          orderId,
          reason: 'Insufficient funds',
        },
      );

      this.logger.warn(`Payment failed for order ${orderId}: Insufficient funds`);
      this.eventBus.publish(new PaymentFailedEvent(orderId, 'Insufficient funds'));
    }
  }
}
