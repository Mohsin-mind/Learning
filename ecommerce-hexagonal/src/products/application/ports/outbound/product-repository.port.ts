import { Product } from "../../../domain/product.entity.js";

export const PRODUCT_REPOSITORY = Symbol("ProductRepository");

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
}
