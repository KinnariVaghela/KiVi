import { Request, Response } from 'express';
import { AppError }          from '../errors';
import { adminService }      from '../service/admin.service';

/**
 * Retrieves all products from the database.
 * @route GET /admin/products
 */
export const adminGetAllProducts = async (_req: Request, res: Response): Promise<void> => {
  res.json(await adminService.getAllProducts());
};

/**
 * Creates a new product with optional image upload.
 * @route POST /admin/products
 * @body {string} name - Product name (required)
 * @body {string} price - Numeric string (required)
 * @body {string} subCategoryId - ID of the sub-category (required)
 * @body {string} [description] - Product details
 * @body {string} [stock] - Initial stock count
 */
export const adminCreateProduct = async (req: Request, res: Response): Promise<void> => {
  const { name, description, price, stock, subCategoryId } = req.body as Record<string, string>;
  if (!name?.trim() || !price || !subCategoryId) {
    res.status(400).json({ error: 'name, price, and subCategoryId are required' }); return;
  }
  try {
    const product = await adminService.createProduct({
      name: name.trim(), description: description?.trim(),
      price: parseFloat(price), stock: parseInt(stock || '0', 10),
      subCategoryId: parseInt(subCategoryId, 10),
      imageFilename: req.file?.filename,
    });
    res.status(201).json(product);
  } catch (err) {
    if (err instanceof AppError) res.status(err.status).json({ error: err.message });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Updates an existing product's details and/or image.
 * @route PUT /admin/products/:id
 * @param {string} id - The unique product ID
 */
export const adminUpdateProduct = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid product id' }); return; }
  const { name, description, price, stock, subCategoryId } = req.body as Record<string, string>;
  try {
    const product = await adminService.updateProduct(id, {
      name: name?.trim(), description,
      price:         price         ? parseFloat(price)           : undefined,
      stock:         stock         ? parseInt(stock, 10)         : undefined,
      subCategoryId: subCategoryId ? parseInt(subCategoryId, 10) : undefined,
      imageFilename: req.file?.filename,
    });
    res.json(product);
  } catch (err) {
    if (err instanceof AppError) res.status(err.status).json({ error: err.message });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Permanently deletes a product by ID.
 * @route DELETE /admin/products/:id
 */
export const adminDeleteProduct = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid product id' }); return; }
  try {
    await adminService.deleteProduct(id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    if (err instanceof AppError) res.status(err.status).json({ error: err.message });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Creates a top-level product type (e.g., Electronics, Apparel).
 * @route POST /admin/types
 */
export const adminCreateType = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body as Record<string, string>;
  if (!name?.trim()) { res.status(400).json({ error: 'Name is required' }); return; }
  res.status(201).json(await adminService.createType(name.trim()));
};

/**
 * Creates a category under a specific product type.
 * @route POST /admin/categories
 */
export const adminCreateCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, productTypeId } = req.body as Record<string, string>;
  if (!name?.trim() || !productTypeId) {
    res.status(400).json({ error: 'name and productTypeId are required' }); return;
  }
  res.status(201).json(await adminService.createCategory(name.trim(), parseInt(productTypeId, 10)));
};

/**
 * Creates a sub-category under a specific category.
 * @route POST /admin/subcategories
 */
export const adminCreateSubCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, categoryId } = req.body as Record<string, string>;
  if (!name?.trim() || !categoryId) {
    res.status(400).json({ error: 'name and categoryId are required' }); return;
  }
  res.status(201).json(await adminService.createSubCategory(name.trim(), parseInt(categoryId, 10)));
};

/**
 * Retrieves a list of all registered customers.
 * @route GET /admin/customers
 */
export const adminGetAllCustomers = async (_req: Request, res: Response): Promise<void> => {
  res.json(await adminService.getAllCustomers());
};

/**
 * Toggles the 'isLocked' status of a customer account.
 * @route PATCH /admin/customers/:id/toggle-lock
 */
export const adminToggleLockCustomer = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid customer id' }); return; }
  try {
    const user = await adminService.toggleLock(id);
    res.json({ message: user.isLocked ? 'Account locked' : 'Account unlocked', isLocked: user.isLocked });
  } catch (err) {
    if (err instanceof AppError) res.status(err.status).json({ error: err.message });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieves all orders placed in the system.
 * @route GET /admin/orders
 */
export const adminGetAllOrders = async (_req: Request, res: Response): Promise<void> => {
  res.json(await adminService.getAllOrders());
};

/**
 * Retrieves full details of a single order by ID.
 * @route GET /admin/orders/:id
 */
export const adminGetOrderById = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid order id' }); return; }
  const order = await adminService.getOrderById(id);
  if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
  res.json(order);
};