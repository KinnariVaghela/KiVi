import { AppDataSource }        from '../data-source';
import { Order, PaymentMethod } from '../entity/Order';
import { OrderItem }            from '../entity/OrderItem';
import { CartItem }             from '../entity/CartItem';
import { Product }              from '../entity/Product';
import { AppError }             from '../errors';

export class OrderService {

  /**
   * Orchestrates the checkout process.
   * 1. Validates cart contents and live stock levels.
   * 2. Snapshots current product prices into OrderItems.
   * 3. Atomically decrements inventory.
   * 4. Clears the user's cart.
   * * @throws {AppError} 400 if cart is empty or stock is insufficient.
   */
  async placeOrder(userId: number, paymentMethod: PaymentMethod): Promise<Order> {
    const cartItems = await AppDataSource.getRepository(CartItem)
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.product', 'product')
      .where('cart.userId = :userId', { userId })
      .getMany();

    if (!cartItems.length) throw new AppError('Cart is empty', 400);

    for (const item of cartItems) {
      if (!item.product || item.product.stock < item.quantity) {
        const name = item.product?.name ?? 'Unknown product';
        throw new AppError(`Insufficient stock for: ${name}`, 400);
      }
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );

    const orderRepo = AppDataSource.getRepository(Order);
    const order     = await orderRepo.save(
      orderRepo.create({ userId, paymentMethod, totalAmount }),
    );

    const orderItemRepo = AppDataSource.getRepository(OrderItem);
    await orderItemRepo.save(
      cartItems.map((item) =>
        orderItemRepo.create({
          orderId:         order.id,
          productId:       item.productId,
          productName:     item.product.name,     
          priceAtPurchase: item.product.price,   
          quantity:        item.quantity,
        }),
      ),
    );

    const productRepo = AppDataSource.getRepository(Product);
    for (const item of cartItems) {
      await productRepo.decrement({ id: item.productId }, 'stock', item.quantity);
    }

    await AppDataSource.getRepository(CartItem).delete({ userId });

    const saved = await orderRepo.findOne({ where: { id: order.id }, relations: ['items'] });
    if (!saved) throw new AppError('Order could not be retrieved after creation', 500);
    return saved;
  }

  /**
   * Returns a chronological history of orders for a specific user.
   */
  async getOrdersForUser(userId: number): Promise<Order[]> {
    return AppDataSource.getRepository(Order)
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.userId = :userId', { userId })
      .orderBy('order.placedAt', 'DESC')
      .getMany();
  }

  /**
   * Fetches a specific order, ensuring it belongs to the requesting user.
   */
  async getOrderForUser(orderId: number, userId: number): Promise<Order | null> {
    return AppDataSource.getRepository(Order)
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.id = :id AND order.userId = :userId', { id: orderId, userId })
      .getOne();
  }
}

export const orderService = new OrderService();