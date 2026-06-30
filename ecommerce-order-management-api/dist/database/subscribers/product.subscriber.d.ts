import { EntitySubscriberInterface, UpdateEvent, InsertEvent } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
export declare class ProductSubscriber implements EntitySubscriberInterface<Product> {
    private readonly logger;
    listenTo(): any;
    beforeInsert(event: InsertEvent<Product>): void;
    beforeUpdate(event: UpdateEvent<Product>): void;
}
