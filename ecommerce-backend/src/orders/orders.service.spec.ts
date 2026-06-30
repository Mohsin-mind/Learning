import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrdersService } from './orders.service';
import { OrderRepository } from './order.repository';
import { ProductRepository } from '@/products/product.repository';
import { QUEUES, ORDER_JOBS } from '@/common/constants/app.constants';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderQueue: { add: jest.Mock };

  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    price: 29.99,
    stock: 10,
  };

  const mockOrder = {
    id: 'order-1',
    userId: 'user-1',
    status: 'pending',
    total: 59.98,
    items: [{}],
  };

  const mockManager = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest
      .fn()
      .mockImplementation((fn: (m: typeof mockManager) => Promise<unknown>) => fn(mockManager)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrderRepository,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockOrder),
            save: jest.fn().mockResolvedValue(mockOrder),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: ProductRepository,
          useValue: { target: 'Product' },
        },
        {
          provide: getQueueToken(QUEUES.ORDERS),
          useValue: { add: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderQueue = module.get(getQueueToken(QUEUES.ORDERS));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw if no items', async () => {
      await expect(service.create('user-1', { items: [] })).rejects.toThrow(BadRequestException);
    });

    it('should throw if product not found', async () => {
      mockManager.findOne.mockResolvedValue(null);
      await expect(
        service.create('user-1', { items: [{ productId: 'missing', quantity: 1 }] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create an order and enqueue order.created job', async () => {
      mockManager.findOne.mockResolvedValue({ ...mockProduct });
      mockManager.save.mockImplementation((entity: unknown) => {
        const e = entity as { userId?: string; items?: unknown[] };
        return Promise.resolve(e.userId ? { ...mockOrder, items: e.items } : entity);
      });

      const result = await service.create('user-1', {
        items: [{ productId: 'product-1', quantity: 2 }],
      });

      expect(result.id).toBe('order-1');
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(orderQueue.add).toHaveBeenCalledWith(ORDER_JOBS.CREATED, {
        orderId: 'order-1',
        userId: 'user-1',
        total: 59.98,
        itemCount: 1,
      });
    });

    it('should enqueue order.failed job on error', async () => {
      mockManager.findOne.mockResolvedValue({ ...mockProduct });
      mockManager.save.mockRejectedValue(new Error('DB error'));

      await expect(
        service.create('user-1', { items: [{ productId: 'product-1', quantity: 1 }] }),
      ).rejects.toThrow('DB error');

      expect(orderQueue.add).toHaveBeenCalledWith(ORDER_JOBS.FAILED, {
        userId: 'user-1',
        reason: 'DB error',
      });
    });
  });
});
