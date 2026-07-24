import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "../../../products/domain/product.entity.js";
import { OrderProductRepository } from "../../application/ports/outbound/product-repository.port.js";
import { TypeOrmProduct } from "../../../products/infrastructure/persistence/typeorm-product.entity.js";

@Injectable()
export class TypeOrmOrderProductRepository implements OrderProductRepository {
  constructor(
    @InjectRepository(TypeOrmProduct)
    private readonly repo: Repository<TypeOrmProduct>,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const orm = await this.repo.findOne({ where: { id } });
    if (!orm) return null;
    return new Product(
      orm.id,
      orm.name,
      orm.description,
      Number(orm.price),
      orm.stock,
      orm.version,
    );
  }

  async updateStock(
    id: string,
    newStock: number,
    version: number,
  ): Promise<void> {
    const result = await this.repo.update(
      { id, version },
      { stock: newStock, version: version + 1 },
    );
    if (result.affected === 0) {
      throw new Error(`Concurrent stock update conflict for product ${id}`);
    }
  }
}
