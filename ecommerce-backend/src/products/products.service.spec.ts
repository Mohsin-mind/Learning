import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductRepository } from './product.repository';
import { Product } from './entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Record<string, jest.Mock>;

  const mockProduct: Product = {
    id: 'uuid-1',
    name: 'Test Product',
    description: 'A test product',
    price: 29.99,
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    deletedAt: null,
    inStock: true,
    formattedPrice: '$29.99',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductRepository,
          useValue: {
            create: jest.fn().mockReturnValue(mockProduct),
            save: jest.fn().mockResolvedValue(mockProduct),
            findOne: jest.fn().mockResolvedValue(mockProduct),
            remove: jest.fn().mockResolvedValue(mockProduct),
            softRemove: jest.fn().mockResolvedValue(mockProduct),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Record<string, jest.Mock>>(ProductRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto = { name: 'Test Product', description: 'Desc', price: 29.99 };
      const result = await service.create(dto);
      expect(result).toEqual(mockProduct);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a product by id', async () => {
      const result = await service.findById('uuid-1');
      expect(result).toEqual(mockProduct);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
    });

    it('should return null if not found', async () => {
      repository.findOne.mockResolvedValue(null);
      const result = await service.findById('nonexistent');
      expect(result).toBeNull();
    });
  });
});
