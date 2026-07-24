import { Product } from "../../../../products/domain/product.entity.js";

export const ORDER_PRODUCT_REPOSITORY = Symbol("OrderProductRepository");

export interface OrderProductRepository {
  findById(id: string): Promise<Product | null>;
  updateStock(id: string, newStock: number, version: number): Promise<void>;
}
