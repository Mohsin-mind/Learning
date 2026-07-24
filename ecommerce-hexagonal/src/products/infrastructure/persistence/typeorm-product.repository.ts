import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "../../domain/product.entity.js";
import { ProductRepository } from "../../application/ports/outbound/product-repository.port.js";
import { TypeOrmProduct } from "./typeorm-product.entity.js";

@Injectable()
export class TypeOrmProductRepository implements ProductRepository {
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
}
