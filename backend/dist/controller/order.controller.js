"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderById = exports.getOrders = exports.checkout = void 0;
const Order_1 = require("../entity/Order");
const errors_1 = require("../errors");
const order_service_1 = require("../service/order.service");
const VALID_PAYMENT_METHODS = Object.values(Order_1.PaymentMethod);
/**
 * Converts the current user's cart into a confirmed order.
 * Validates the payment method and clears the cart upon success.
 * @route POST /orders/checkout
 * @authentication Required
 * @body {PaymentMethod} paymentMethod - Must be one of the defined PaymentMethod enum values.
 * @returns {Promise<void>} 201 Created with the Order object.
 */
const checkout = async (req, res) => {
    const { paymentMethod } = req.body;
    if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
        res.status(400).json({ error: 'A valid payment method is required', options: VALID_PAYMENT_METHODS });
        return;
    }
    try {
        const order = await order_service_1.orderService.placeOrder(req.user.id, paymentMethod);
        res.status(201).json(order);
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            res.status(err.status).json({ error: err.message });
        else
            res.status(500).json({ error: 'Internal server error' });
    }
};
exports.checkout = checkout;
/**
 * Retrieves all previous orders for the currently authenticated user.
 * @route GET /orders
 * @authentication Required
 */
const getOrders = async (req, res) => {
    res.json(await order_service_1.orderService.getOrdersForUser(req.user.id));
};
exports.getOrders = getOrders;
/**
 * Retrieves the details of a specific order by ID.
 * Verifies that the order belongs to the requesting user.
 * @route GET /orders/:id
 * @authentication Required
 * @param {string} id - The unique Order ID.
 */
const getOrderById = async (req, res) => {
    const orderId = parseInt(req.params['id'], 10);
    if (isNaN(orderId)) {
        res.status(400).json({ error: 'Invalid order id' });
        return;
    }
    const order = await order_service_1.orderService.getOrderForUser(orderId, req.user.id);
    if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
    }
    res.json(order);
};
exports.getOrderById = getOrderById;
