"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGetOrderById = exports.adminGetAllOrders = exports.adminToggleLockCustomer = exports.adminGetAllCustomers = exports.adminCreateSubCategory = exports.adminCreateCategory = exports.adminCreateType = exports.adminDeleteProduct = exports.adminUpdateProduct = exports.adminCreateProduct = exports.adminGetAllProducts = void 0;
const errors_1 = require("../errors");
const admin_service_1 = require("../service/admin.service");
/**
 * Retrieves all products from the database.
 * @route GET /admin/products
 */
const adminGetAllProducts = async (_req, res) => {
    res.json(await admin_service_1.adminService.getAllProducts());
};
exports.adminGetAllProducts = adminGetAllProducts;
/**
 * Creates a new product with optional image upload.
 * @route POST /admin/products
 * @body {string} name - Product name (required)
 * @body {string} price - Numeric string (required)
 * @body {string} subCategoryId - ID of the sub-category (required)
 * @body {string} [description] - Product details
 * @body {string} [stock] - Initial stock count
 */
const adminCreateProduct = async (req, res) => {
    const { name, description, price, stock, subCategoryId } = req.body;
    if (!name?.trim() || !price || !subCategoryId) {
        res.status(400).json({ error: 'name, price, and subCategoryId are required' });
        return;
    }
    try {
        const product = await admin_service_1.adminService.createProduct({
            name: name.trim(), description: description?.trim(),
            price: parseFloat(price), stock: parseInt(stock || '0', 10),
            subCategoryId: parseInt(subCategoryId, 10),
            imageFilename: req.file?.filename,
        });
        res.status(201).json(product);
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            res.status(err.status).json({ error: err.message });
        else
            res.status(500).json({ error: 'Internal server error' });
    }
};
exports.adminCreateProduct = adminCreateProduct;
/**
 * Updates an existing product's details and/or image.
 * @route PUT /admin/products/:id
 * @param {string} id - The unique product ID
 */
const adminUpdateProduct = async (req, res) => {
    const id = parseInt(req.params['id'], 10);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid product id' });
        return;
    }
    const { name, description, price, stock, subCategoryId } = req.body;
    try {
        const product = await admin_service_1.adminService.updateProduct(id, {
            name: name?.trim(), description,
            price: price ? parseFloat(price) : undefined,
            stock: stock ? parseInt(stock, 10) : undefined,
            subCategoryId: subCategoryId ? parseInt(subCategoryId, 10) : undefined,
            imageFilename: req.file?.filename,
        });
        res.json(product);
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            res.status(err.status).json({ error: err.message });
        else
            res.status(500).json({ error: 'Internal server error' });
    }
};
exports.adminUpdateProduct = adminUpdateProduct;
/**
 * Permanently deletes a product by ID.
 * @route DELETE /admin/products/:id
 */
const adminDeleteProduct = async (req, res) => {
    const id = parseInt(req.params['id'], 10);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid product id' });
        return;
    }
    try {
        await admin_service_1.adminService.deleteProduct(id);
        res.json({ message: 'Product deleted' });
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            res.status(err.status).json({ error: err.message });
        else
            res.status(500).json({ error: 'Internal server error' });
    }
};
exports.adminDeleteProduct = adminDeleteProduct;
/**
 * Creates a top-level product type (e.g., Electronics, Apparel).
 * @route POST /admin/types
 */
const adminCreateType = async (req, res) => {
    const { name } = req.body;
    if (!name?.trim()) {
        res.status(400).json({ error: 'Name is required' });
        return;
    }
    res.status(201).json(await admin_service_1.adminService.createType(name.trim()));
};
exports.adminCreateType = adminCreateType;
/**
 * Creates a category under a specific product type.
 * @route POST /admin/categories
 */
const adminCreateCategory = async (req, res) => {
    const { name, productTypeId } = req.body;
    if (!name?.trim() || !productTypeId) {
        res.status(400).json({ error: 'name and productTypeId are required' });
        return;
    }
    res.status(201).json(await admin_service_1.adminService.createCategory(name.trim(), parseInt(productTypeId, 10)));
};
exports.adminCreateCategory = adminCreateCategory;
/**
 * Creates a sub-category under a specific category.
 * @route POST /admin/subcategories
 */
const adminCreateSubCategory = async (req, res) => {
    const { name, categoryId } = req.body;
    if (!name?.trim() || !categoryId) {
        res.status(400).json({ error: 'name and categoryId are required' });
        return;
    }
    res.status(201).json(await admin_service_1.adminService.createSubCategory(name.trim(), parseInt(categoryId, 10)));
};
exports.adminCreateSubCategory = adminCreateSubCategory;
/**
 * Retrieves a list of all registered customers.
 * @route GET /admin/customers
 */
const adminGetAllCustomers = async (_req, res) => {
    res.json(await admin_service_1.adminService.getAllCustomers());
};
exports.adminGetAllCustomers = adminGetAllCustomers;
/**
 * Toggles the 'isLocked' status of a customer account.
 * @route PATCH /admin/customers/:id/toggle-lock
 */
const adminToggleLockCustomer = async (req, res) => {
    const id = parseInt(req.params['id'], 10);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid customer id' });
        return;
    }
    try {
        const user = await admin_service_1.adminService.toggleLock(id);
        res.json({ message: user.isLocked ? 'Account locked' : 'Account unlocked', isLocked: user.isLocked });
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            res.status(err.status).json({ error: err.message });
        else
            res.status(500).json({ error: 'Internal server error' });
    }
};
exports.adminToggleLockCustomer = adminToggleLockCustomer;
/**
 * Retrieves all orders placed in the system.
 * @route GET /admin/orders
 */
const adminGetAllOrders = async (_req, res) => {
    res.json(await admin_service_1.adminService.getAllOrders());
};
exports.adminGetAllOrders = adminGetAllOrders;
/**
 * Retrieves full details of a single order by ID.
 * @route GET /admin/orders/:id
 */
const adminGetOrderById = async (req, res) => {
    const id = parseInt(req.params['id'], 10);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid order id' });
        return;
    }
    const order = await admin_service_1.adminService.getOrderById(id);
    if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
    }
    res.json(order);
};
exports.adminGetOrderById = adminGetOrderById;
