"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProductSubscriber_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSubscriber = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const product_entity_1 = require("../../products/entities/product.entity");
let ProductSubscriber = ProductSubscriber_1 = class ProductSubscriber {
    logger = new common_1.Logger(ProductSubscriber_1.name);
    listenTo() {
        return product_entity_1.Product;
    }
    beforeInsert(event) {
        this.logger.log(`Inserting product: ${event.entity.name}`);
    }
    beforeUpdate(event) {
        const entity = event.entity;
        const databaseEntity = event.databaseEntity;
        if (entity && databaseEntity) {
            const oldStock = databaseEntity.stock;
            const newStock = entity.stock;
            if (oldStock !== newStock) {
                this.logger.log(`Stock changed for "${entity.name}": ${oldStock} -> ${newStock}`);
            }
        }
    }
};
exports.ProductSubscriber = ProductSubscriber;
exports.ProductSubscriber = ProductSubscriber = ProductSubscriber_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, typeorm_1.EventSubscriber)()
], ProductSubscriber);
//# sourceMappingURL=product.subscriber.js.map