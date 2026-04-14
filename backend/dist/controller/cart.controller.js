"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.deleteCartItem = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const errors_1 = require("../errors");
const cart_service_1 = require("../service/cart.service");
/**
 * Retrieves the current user's shopping cart.
 * Uses the authenticated user's ID from the request context.
 * @route GET /cart
 * @authentication Required
 */
const getCart = async (req, res) => {
    res.json(await cart_service_1.cartService.getCart(req.user.id));
};
exports.getCart = getCart;
/**
 * Adds a product to the cart or increments quantity if it already exists.
 * @route POST /cart
 * @body {number} productId - The ID of the product to add
 * @body {number} quantity - Must be 1 or greater
 * @authentication Required
 */
const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const pid = Number(productId);
    const qty = Number(quantity);
    if (!pid || isNaN(pid) || qty < 1 || isNaN(qty)) {
        res.status(400).json({ error: 'Valid productId and quantity (≥ 1) are required' });
        return;
    }
    try {
        const item = await cart_service_1.cartService.addOrUpdate(req.user.id, pid, qty);
        res.json({ message: 'Cart updated', item });
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            res.status(err.status).json({ error: err.message });
        else
            res.status(500).json({ error: 'Internal server error' });
    }
};
exports.addToCart = addToCart;
/**
 * Updates the quantity of a specific item already in the cart.
 * @route PATCH /cart/items/:itemId
 * @param {string} itemId - The ID of the cart record (not the product ID)
 * @body {number} quantity - The new total quantity (must be ≥ 1)
 * @authentication Required
 */
const updateCartItem = async (req, res) => {
    const itemId = parseInt(req.params['itemId'], 10);
    const qty = Number(req.body.quantity);
    if (isNaN(itemId)) {
        res.status(400).json({ error: 'Invalid item id' });
        return;
    }
    if (isNaN(qty) || qty < 1) {
        res.status(400).json({ error: 'Quantity must be at least 1' });
        return;
    }
    try {
        const item = await cart_service_1.cartService.updateQty(req.user.id, itemId, qty);
        res.json({ message: 'Quantity updated', item });
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            res.status(err.status).json({ error: err.message });
        else
            res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateCartItem = updateCartItem;
/**
 * Removes a single item from the user's cart.
 * @route DELETE /cart/items/:itemId
 * @param {string} itemId - The ID of the cart record to remove
 * @authentication Required
 */
const deleteCartItem = async (req, res) => {
    const itemId = parseInt(req.params['itemId'], 10);
    if (isNaN(itemId)) {
        res.status(400).json({ error: 'Invalid item id' });
        return;
    }
    try {
        await cart_service_1.cartService.removeItem(req.user.id, itemId);
        res.json({ message: 'Item removed' });
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            res.status(err.status).json({ error: err.message });
        else
            res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deleteCartItem = deleteCartItem;
/**
 * Removes all items from the current user's cart.
 * Typically called after a successful order checkout.
 * @route DELETE /cart
 * @authentication Required
 */
const clearCart = async (req, res) => {
    await cart_service_1.cartService.clearCart(req.user.id);
    res.json({ message: 'Cart cleared' });
};
exports.clearCart = clearCart;
