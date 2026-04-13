import { Request, Response } from 'express';
import { PaymentMethod }     from '../entity/Order';
import { AuthUser }          from '../middleware/auth';
import { AppError }          from '../errors';
import { orderService }      from '../service/order.service';

const VALID_PAYMENT_METHODS = Object.values(PaymentMethod);

/**
 * Converts the current user's cart into a confirmed order.
 * Validates the payment method and clears the cart upon success.
 * @route POST /orders/checkout
 * @authentication Required
 * @body {PaymentMethod} paymentMethod - Must be one of the defined PaymentMethod enum values.
 * @returns {Promise<void>} 201 Created with the Order object.
 */
export const checkout = async (req: Request, res: Response): Promise<void> => {
  const { paymentMethod } = req.body as Record<string, unknown>;
  if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)) {
    res.status(400).json({ error: 'A valid payment method is required', options: VALID_PAYMENT_METHODS });
    return;
  }
  try {
    const order = await orderService.placeOrder((req.user as AuthUser).id, paymentMethod as PaymentMethod);
    res.status(201).json(order);
  } catch (err) {
    if (err instanceof AppError) res.status(err.status).json({ error: err.message });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieves all previous orders for the currently authenticated user.
 * @route GET /orders
 * @authentication Required
 */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  res.json(await orderService.getOrdersForUser((req.user as AuthUser).id));
};

/**
 * Retrieves the details of a specific order by ID.
 * Verifies that the order belongs to the requesting user.
 * @route GET /orders/:id
 * @authentication Required
 * @param {string} id - The unique Order ID.
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  const orderId = parseInt(req.params['id'] as string, 10);
  if (isNaN(orderId)) { res.status(400).json({ error: 'Invalid order id' }); return; }
  const order = await orderService.getOrderForUser(orderId, (req.user as AuthUser).id);
  if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
  res.json(order);
};