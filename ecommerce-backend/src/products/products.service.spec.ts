import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductRepository } from './product.repository';
import { Product } from './entities/product.entity';
import { AlgoliaService } from '@/common/services/algolia.service';
import { ALGOLIA_INDEX } from '@/common/constants/app.constants';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Record<string, jest.Mock>;
  let algolia: Record<string, jest.Mock>;

  const createMockProduct = (): Product => ({
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
  });

  let mockProduct: Product;

  beforeEach(async () => {
    mockProduct = createMockProduct();

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
        {
          provide: AlgoliaService,
          useValue: {
            saveObject: jest.fn().mockResolvedValue(undefined),
            deleteObject: jest.fn().mockResolvedValue(undefined),
            search: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Record<string, jest.Mock>>(ProductRepository);
    algolia = module.get<Record<string, jest.Mock>>(AlgoliaService);
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
      expect(algolia.saveObject).toHaveBeenCalledWith(
        ALGOLIA_INDEX.PRODUCTS,
        expect.objectContaining({
          objectID: mockProduct.id,
          id: mockProduct.id,
          name: mockProduct.name,
          description: mockProduct.description,
          price: mockProduct.price,
          stock: mockProduct.stock,
          inStock: true,
        }),
      );
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

  describe('update', () => {
    it('should update a product and re-index it', async () => {
      const result = await service.update('uuid-1', { stock: 5 });

      expect(result).toEqual(mockProduct);
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ stock: 5 }));
      expect(algolia.saveObject).toHaveBeenCalledWith(
        ALGOLIA_INDEX.PRODUCTS,
        expect.objectContaining({ objectID: mockProduct.id, stock: 5 }),
      );
    });
  });

  describe('remove', () => {
    it('should soft-delete a product and remove it from Algolia', async () => {
      await service.remove('uuid-1');

      expect(repository.softRemove).toHaveBeenCalledWith(mockProduct);
      expect(algolia.deleteObject).toHaveBeenCalledWith(ALGOLIA_INDEX.PRODUCTS, mockProduct.id);
    });
  });
});
