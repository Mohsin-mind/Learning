import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentsService } from './payments.service';
import { PaymentRepository } from './payment.repository';
import { OrderRepository } from '../orders/order.repository';
import { Payment, PaymentStatus, PaymentProvider } from './entities/payment.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockOrder = {
    id: 'order-1',
    userId: 'user-1',
    status: OrderStatus.PENDING,
    total: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Order;

  const mockPayment = {
    id: 'payment-1',
    orderId: 'order-1',
    amount: 100,
    status: PaymentStatus.COMPLETED,
    provider: PaymentProvider.STRIPE,
    transactionId: 'txn-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Payment;

  const mockOrderRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockPaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: OrderRepository, useValue: mockOrderRepository },
        { provide: PaymentRepository, useValue: mockPaymentRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleWebhook', () => {
    it('should throw NotFoundException if order does not exist', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);
      await expect(
        service.handleWebhook({
          orderId: 'invalid',
          transactionId: 'txn',
          amount: 100,
          success: true,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should confirm order and create payment on success', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockPaymentRepository.create.mockReturnValue(mockPayment);
      mockPaymentRepository.save.mockResolvedValue(mockPayment);

      const result = await service.handleWebhook({
        orderId: 'order-1',
        transactionId: 'txn-123',
        amount: 100,
        success: true,
      });

      expect(mockOrderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.CONFIRMED }),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('payment.processed', {
        orderId: 'order-1',
        paymentId: 'payment-1',
        success: true,
      });
      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });

    it('should create failed payment on failure without confirming order', async () => {
      const failedPayment = { ...mockPayment, status: PaymentStatus.FAILED };
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);
      mockPaymentRepository.create.mockReturnValue(failedPayment);
      mockPaymentRepository.save.mockResolvedValue(failedPayment);

      const result = await service.handleWebhook({
        orderId: 'order-1',
        transactionId: 'txn-456',
        amount: 100,
        success: false,
      });

      expect(mockOrderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.CANCELLED }),
      );
      expect(result.status).toBe(PaymentStatus.FAILED);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('payment.processed', {
        orderId: 'order-1',
        paymentId: 'payment-1',
        success: false,
      });
    });
  });
});
