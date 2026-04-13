import { AppDataSource } from '../data-source';
import { CartItem }      from '../entity/CartItem';
import { Product }       from '../entity/Product';
import { AppError }      from '../errors';

export class CartService {

  /**
   * Retrieves all items in a user's cart with associated product details.
   * @param userId - The ID of the authenticated user.
   */
  async getCart(userId: number): Promise<CartItem[]> {
    return AppDataSource.getRepository(CartItem)
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
  async addOrUpdate(
    userId:    number,
    productId: number,
    quantity:  number,
  ): Promise<CartItem> {
    const product = await AppDataSource.getRepository(Product).findOneBy({ id: productId });
    if (!product)          throw new AppError('Product not found', 404);
    if (product.stock < 1) throw new AppError('Product is out of stock', 400);

    const repo = AppDataSource.getRepository(CartItem);
    let item   = await repo.findOneBy({ userId, productId });

    if (item) {
      item.quantity = Math.min(quantity, product.stock);
    } else {
      item = repo.create({ userId, productId, quantity: Math.min(quantity, product.stock) });
    }

    return repo.save(item);
  }

  /**
   * Updates the quantity of an existing cart item.
   * Validates that the item belongs to the user and respects stock limits.
   * @throws {AppError} 404 if the item ID does not exist for this user.
   */
  async updateQty(userId: number, itemId: number, quantity: number): Promise<CartItem> {
    const repo = AppDataSource.getRepository(CartItem);
    const item = await repo.findOne({ where: { id: itemId, userId }, relations: ['product'] });
    if (!item) throw new AppError('Cart item not found', 404);

    item.quantity = Math.min(quantity, item.product.stock);
    return repo.save(item);
  }

  /**
   * Removes a specific item from the user's cart.
   * @throws {AppError} 404 if the item ID does not belong to the user.
   */
  async removeItem(userId: number, itemId: number): Promise<void> {
    const repo = AppDataSource.getRepository(CartItem);
    const item = await repo.findOneBy({ id: itemId, userId });
    if (!item) throw new AppError('Cart item not found', 404);
    await repo.remove(item);
  }

  /**
   * Deletes all items from a user's cart. 
   * Usually called after a successful order placement.
   */
  async clearCart(userId: number): Promise<void> {
    await AppDataSource.getRepository(CartItem).delete({ userId });
  }
}

export const cartService = new CartService();