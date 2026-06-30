"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const product_repository_1 = require("./product.repository");
let ProductsService = class ProductsService {
    productRepository;
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    async create(dto) {
        const product = this.productRepository.create(dto);
        return this.productRepository.save(product);
    }
    async findAll(query) {
        const { page = 1, limit = 10, sortBy, sortOrder = 'DESC', search } = query;
        const queryBuilder = this.productRepository.createQueryBuilder('product');
        if (search) {
            queryBuilder.where('product.name ILIKE :search OR product.description ILIKE :search', {
                search: `%${search}%`,
            });
        }
        const allowedSortFields = ['name', 'price', 'stock', 'createdAt', 'updatedAt'];
        const orderField = sortBy && allowedSortFields.includes(sortBy) ? `product.${sortBy}` : 'product.createdAt';
        const order = sortOrder;
        queryBuilder.orderBy(orderField, order);
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);
        const [data, total] = await queryBuilder.getManyAndCount();
        const totalPages = Math.ceil(total / limit);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
    async findById(id) {
        return this.productRepository.findOne({ where: { id } });
    }
    async update(id, dto) {
        const product = await this.findById(id);
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        Object.assign(product, dto);
        return this.productRepository.save(product);
    }
    async remove(id) {
        const product = await this.findById(id);
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        await this.productRepository.softRemove(product);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof product_repository_1.ProductRepository !== "undefined" && product_repository_1.ProductRepository) === "function" ? _a : Object])
], ProductsService);
//# sourceMappingURL=products.service.js.map