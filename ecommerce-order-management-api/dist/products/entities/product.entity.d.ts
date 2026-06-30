export declare class Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    createdAt: Date;
    updatedAt: Date;
    version: number;
    deletedAt: Date | null;
    get inStock(): boolean;
    get formattedPrice(): string;
}
