import { Request, Response } from 'express';
import { productService }    from '../service/product.service';

/**
 * Retrieves a paginated list of products based on various filters.
 * @route GET /products
 * @query {string} [search] - Text search for product name or description
 * @query {string} [typeId] - Filter by top-level product type ID
 * @query {string} [categoryId] - Filter by category ID
 * @query {string} [subCategoryId] - Filter by sub-category ID
 * @query {string} [minPrice] - Minimum price threshold
 * @query {string} [maxPrice] - Maximum price threshold
 * @query {string} [inStock] - Set to 'true' to show only items with stock > 0
 * @query {string} [page=1] - Results page number
 * @query {string} [limit=12] - Number of items per page
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const {
    search, typeId, categoryId, subCategoryId,
    minPrice, maxPrice, inStock, page, limit,
  } = req.query as Record<string, string | undefined>;

  res.json(await productService.findAll({
    search,
    typeId:        typeId        ? +typeId        : undefined,
    categoryId:    categoryId    ? +categoryId    : undefined,
    subCategoryId: subCategoryId ? +subCategoryId : undefined,
    minPrice:      minPrice      ? +minPrice      : undefined,
    maxPrice:      maxPrice      ? +maxPrice      : undefined,
    inStock:       inStock === 'true',
    page:          page          ? +page          : 1,
    limit:         limit         ? +limit         : 12,
  }));
};

/**
 * Retrieves a curated list of featured products for the home page.
 * @route GET /products/featured
 */
export const getFeaturedProducts = async (_req: Request, res: Response): Promise<void> => {
  res.json(await productService.findFeatured());
};

/**
 * Retrieves full details for a single product.
 * @route GET /products/:id
 * @param {string} id - The unique product ID
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params['id'] as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid product id' }); return; }
  const product = await productService.findById(id);
  if (!product)  { res.status(404).json({ error: 'Product not found' });  return; }
  res.json(product);
};

/**
 * Retrieves the full category hierarchy (Types -> Categories -> SubCategories).
 * Useful for building navigation menus or filter sidebars.
 * @route GET /products/taxonomy
 */
export const getTaxonomy = async (_req: Request, res: Response): Promise<void> => {
  res.json(await productService.findTaxonomy());
};