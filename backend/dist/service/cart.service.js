"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartService = exports.CartService = void 0;
const data_source_1 = require("../data-source");
const CartItem_1 = require("../entity/CartItem");
const Product_1 = require("../entity/Product");
const errors_1 = require("../errors");
class CartService {
    /**
     * Retrieves all items in a user's cart with associated product details.
     * @param userId - The ID of the authenticated user.
     */
    async getCart(userId) {
        return data_source_1.AppDataSource.getRepository(CartItem_1.CartItem)
            .createQueryBuilder('cart')
            .leftJoinAndSelect('cart.product', 'product')
            .where('cart.userId = :userId', { userId })
            .getMany();
    }
    /**
     * Adds a product to the cart or updates the quantity if it already exists.
     * Automatically caps the quantity at the current available stock level.
     * @throws {AppError} 404 if product doesn't exist.
     * @throws {AppError} 400 if product is out of stock.
     */
    async addOrUpdate(userId, productId, quantity) {
        const product = await data_source_1.AppDataSource.getRepository(Product_1.Product).findOneBy({ id: productId });
        if (!product)
            throw new errors_1.AppError('Product not found', 404);
        if (product.stock < 1)
            throw new errors_1.AppError('Product is out of stock', 400);
        const repo = data_source_1.AppDataSource.getRepository(CartItem_1.CartItem);
        let item = await repo.findOneBy({ userId, productId });
        if (item) {
            item.quantity = Math.min(quantity, product.stock);
        }
        else {
            item = repo.create({ userId, productId, quantity: Math.min(quantity, product.stock) });
        }
        return repo.save(item);
    }
    /**
     * Updates the quantity of an existing cart item.
     * Validates that the item belongs to the user and respects stock limits.
     * @throws {AppError} 404 if the item ID does not exist for this user.
     */
    async updateQty(userId, itemId, quantity) {
        const repo = data_source_1.AppDataSource.getRepository(CartItem_1.CartItem);
        const item = await repo.findOne({ where: { id: itemId, userId }, relations: ['product'] });
        if (!item)
            throw new errors_1.AppError('Cart item not found', 404);
        item.quantity = Math.min(quantity, item.product.stock);
        return repo.save(item);
    }
    /**
     * Removes a specific item from the user's cart.
     * @throws {AppError} 404 if the item ID does not belong to the user.
     */
    async removeItem(userId, itemId) {
        const repo = data_source_1.AppDataSource.getRepository(CartItem_1.CartItem);
        const item = await repo.findOneBy({ id: itemId, userId });
        if (!item)
            throw new errors_1.AppError('Cart item not found', 404);
        await repo.remove(item);
    }
    /**
     * Deletes all items from a user's cart.
     * Usually called after a successful order placement.
     */
    async clearCart(userId) {
        await data_source_1.AppDataSource.getRepository(CartItem_1.CartItem).delete({ userId });
    }
}
exports.CartService = CartService;
exports.cartService = new CartService();
