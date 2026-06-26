import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderRepository } from '../orders/order.repository';
import { ProductRepository } from '../products/product.repository';

@Injectable()
export class OrderEventListener {
  private readonly logger = new Logger(OrderEventListener.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  @OnEvent('order.created')
  async handleOrderCreated(payload: { orderId: string; userId: string }) {
    const order = await this.orderRepository.findOne({
      where: { id: payload.orderId },
      relations: { items: true },
    });

    if (!order) {
      this.logger.error(`Order ${payload.orderId} not found for stock deduction`);
      return;
    }

    for (const item of order.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (product) {
        product.stock -= item.quantity;
        await this.productRepository.save(product);
        this.logger.log(
          `Deducted ${item.quantity} from product ${product.name} (stock: ${product.stock})`,
        );
      }
    }
  }

  @OnEvent('payment.processed')
  handlePaymentProcessed(payload: { orderId: string; paymentId: string; success: boolean }) {
    if (payload.success) {
      this.logger.log(`Payment ${payload.paymentId} succeeded for order ${payload.orderId}`);
    } else {
      this.logger.warn(`Payment ${payload.paymentId} failed for order ${payload.orderId}`);
    }
  }
}
