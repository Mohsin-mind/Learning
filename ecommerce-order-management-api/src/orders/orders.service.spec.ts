import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { OrdersService } from './orders.service';
import { OrderRepository } from './order.repository';
import { ProductRepository } from '../products/product.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { QUEUES, ORDER_JOBS } from '../common/constants/app.constants';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderQueue: { add: jest.Mock };

  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    description: 'Desc',
    price: 29.99,
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrder = {
    id: 'order-1',
    userId: 'user-1',
    status: 'pending',
    total: 59.98,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryRunner = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager: {
      findOne: jest.fn(),
      save: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrderRepository,
          useValue: {
            find: jest.fn(),
            findOne: jest.fn().mockResolvedValue(mockOrder),
            save: jest.fn().mockResolvedValue(mockOrder),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: ProductRepository,
          useValue: {
            target: 'Product',
            findOne: jest.fn(),
          },
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
      mockQueryRunner.manager.findOne.mockResolvedValue(null);
      await expect(
        service.create('user-1', { items: [{ productId: 'missing', quantity: 1 }] }),
      ).rejects.toThrow(NotFoundException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should create an order successfully and commit the transaction', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue({ ...mockProduct });
      mockQueryRunner.manager.save.mockImplementation((entity: unknown) => {
        const orderEntity = entity as { userId?: string; items?: unknown[] };
        if (orderEntity.userId) {
          return Promise.resolve({ ...mockOrder, id: 'order-1', items: orderEntity.items });
        }
        return Promise.resolve(entity);
      });

      const result = await service.create('user-1', {
        items: [{ productId: 'product-1', quantity: 2 }],
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('order-1');
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.manager.findOne).toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(2);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(orderQueue.add).toHaveBeenCalledWith(ORDER_JOBS.CREATED, {
        orderId: 'order-1',
        userId: 'user-1',
        total: 59.98,
        itemCount: 1,
      });
    });

    it('should rollback transaction if save fails', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue({ ...mockProduct });
      mockQueryRunner.manager.save.mockRejectedValue(new Error('DB Save Error'));

      await expect(
        service.create('user-1', { items: [{ productId: 'product-1', quantity: 1 }] }),
      ).rejects.toThrow('DB Save Error');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});
