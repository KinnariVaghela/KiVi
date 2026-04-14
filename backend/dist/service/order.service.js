"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = exports.OrderService = void 0;
const data_source_1 = require("../data-source");
const Order_1 = require("../entity/Order");
const OrderItem_1 = require("../entity/OrderItem");
const CartItem_1 = require("../entity/CartItem");
const Product_1 = require("../entity/Product");
const errors_1 = require("../errors");
class OrderService {
    /**
     * Orchestrates the checkout process.
     * 1. Validates cart contents and live stock levels.
     * 2. Snapshots current product prices into OrderItems.
     * 3. Atomically decrements inventory.
     * 4. Clears the user's cart.
     * * @throws {AppError} 400 if cart is empty or stock is insufficient.
     */
    async placeOrder(userId, paymentMethod) {
        const cartItems = await data_source_1.AppDataSource.getRepository(CartItem_1.CartItem)
            .createQueryBuilder('cart')
            .leftJoinAndSelect('cart.product', 'product')
            .where('cart.userId = :userId', { userId })
            .getMany();
        if (!cartItems.length)
            throw new errors_1.AppError('Cart is empty', 400);
        for (const item of cartItems) {
            if (!item.product || item.product.stock < item.quantity) {
                const name = item.product?.name ?? 'Unknown product';
                throw new errors_1.AppError(`Insufficient stock for: ${name}`, 400);
            }
        }
        const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
        const orderRepo = data_source_1.AppDataSource.getRepository(Order_1.Order);
        const order = await orderRepo.save(orderRepo.create({ userId, paymentMethod, totalAmount }));
        const orderItemRepo = data_source_1.AppDataSource.getRepository(OrderItem_1.OrderItem);
        await orderItemRepo.save(cartItems.map((item) => orderItemRepo.create({
            orderId: order.id,
            productId: item.productId,
            productName: item.product.name,
            priceAtPurchase: item.product.price,
            quantity: item.quantity,
        })));
        const productRepo = data_source_1.AppDataSource.getRepository(Product_1.Product);
        for (const item of cartItems) {
            await productRepo.decrement({ id: item.productId }, 'stock', item.quantity);
        }
        await data_source_1.AppDataSource.getRepository(CartItem_1.CartItem).delete({ userId });
        const saved = await orderRepo.findOne({ where: { id: order.id }, relations: ['items'] });
        if (!saved)
            throw new errors_1.AppError('Order could not be retrieved after creation', 500);
        return saved;
    }
    /**
     * Returns a chronological history of orders for a specific user.
     */
    async getOrdersForUser(userId) {
        return data_source_1.AppDataSource.getRepository(Order_1.Order)
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .where('order.userId = :userId', { userId })
            .orderBy('order.placedAt', 'DESC')
            .getMany();
    }
    /**
     * Fetches a specific order, ensuring it belongs to the requesting user.
     */
    async getOrderForUser(orderId, userId) {
        return data_source_1.AppDataSource.getRepository(Order_1.Order)
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .where('order.id = :id AND order.userId = :userId', { id: orderId, userId })
            .getOne();
    }
}
exports.OrderService = OrderService;
exports.orderService = new OrderService();
