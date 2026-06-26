import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrderRepository } from './order.repository';
import { ProductRepository } from '../products/product.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('OrdersService', () => {
  let service: OrdersService;
  let productRepository: Record<string, jest.Mock>;

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

  beforeEach(async () => {
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
            findOne: jest.fn().mockResolvedValue(mockProduct),
          },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    productRepository = module.get(ProductRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw if no items', async () => {
      await expect(service.create('user-1', { items: [] })).rejects.toThrow(BadRequestException);
    });

    it('should throw if product not found', async () => {
      productRepository.findOne.mockResolvedValue(null);
      await expect(
        service.create('user-1', { items: [{ productId: 'missing', quantity: 1 }] }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
