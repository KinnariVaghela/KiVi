import { Request, Response } from 'express';
import { AuthUser }          from '../middleware/auth';
import { AppError }          from '../errors';
import { cartService }       from '../service/cart.service';

/**
 * Retrieves the current user's shopping cart.
 * Uses the authenticated user's ID from the request context.
 * @route GET /cart
 * @authentication Required
 */
export const getCart = async (req: Request, res: Response): Promise<void> => {
  res.json(await cartService.getCart((req.user as AuthUser).id));
};

/**
 * Adds a product to the cart or increments quantity if it already exists.
 * @route POST /cart
 * @body {number} productId - The ID of the product to add
 * @body {number} quantity - Must be 1 or greater
 * @authentication Required
 */
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  const { productId, quantity } = req.body as Record<string, unknown>;
  const pid = Number(productId);
  const qty = Number(quantity);
  if (!pid || isNaN(pid) || qty < 1 || isNaN(qty)) {
    res.status(400).json({ error: 'Valid productId and quantity (≥ 1) are required' }); return;
  }
  try {
    const item = await cartService.addOrUpdate((req.user as AuthUser).id, pid, qty);
    res.json({ message: 'Cart updated', item });
  } catch (err) {
    if (err instanceof AppError) res.status(err.status).json({ error: err.message });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Updates the quantity of a specific item already in the cart.
 * @route PATCH /cart/items/:itemId
 * @param {string} itemId - The ID of the cart record (not the product ID)
 * @body {number} quantity - The new total quantity (must be ≥ 1)
 * @authentication Required
 */
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  const itemId = parseInt(req.params['itemId'] as string, 10);
  const qty    = Number(req.body.quantity);
  if (isNaN(itemId)) { res.status(400).json({ error: 'Invalid item id' }); return; }
  if (isNaN(qty) || qty < 1) { res.status(400).json({ error: 'Quantity must be at least 1' }); return; }
  try {
    const item = await cartService.updateQty((req.user as AuthUser).id, itemId, qty);
    res.json({ message: 'Quantity updated', item });
  } catch (err) {
    if (err instanceof AppError) res.status(err.status).json({ error: err.message });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Removes a single item from the user's cart.
 * @route DELETE /cart/items/:itemId
 * @param {string} itemId - The ID of the cart record to remove
 * @authentication Required
 */
export const deleteCartItem = async (req: Request, res: Response): Promise<void> => {
  const itemId = parseInt(req.params['itemId'] as string, 10);
  if (isNaN(itemId)) { res.status(400).json({ error: 'Invalid item id' }); return; }
  try {
    await cartService.removeItem((req.user as AuthUser).id, itemId);
    res.json({ message: 'Item removed' });
  } catch (err) {
    if (err instanceof AppError) res.status(err.status).json({ error: err.message });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Removes all items from the current user's cart.
 * Typically called after a successful order checkout.
 * @route DELETE /cart
 * @authentication Required
 */
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  await cartService.clearCart((req.user as AuthUser).id);
  res.json({ message: 'Cart cleared' });
};