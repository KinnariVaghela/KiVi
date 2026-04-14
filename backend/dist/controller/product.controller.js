"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaxonomy = exports.getProductById = exports.getFeaturedProducts = exports.getProducts = void 0;
const product_service_1 = require("../service/product.service");
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
const getProducts = async (req, res) => {
    const { search, typeId, categoryId, subCategoryId, minPrice, maxPrice, inStock, page, limit, } = req.query;
    res.json(await product_service_1.productService.findAll({
        search,
        typeId: typeId ? +typeId : undefined,
        categoryId: categoryId ? +categoryId : undefined,
        subCategoryId: subCategoryId ? +subCategoryId : undefined,
        minPrice: minPrice ? +minPrice : undefined,
        maxPrice: maxPrice ? +maxPrice : undefined,
        inStock: inStock === 'true',
        page: page ? +page : 1,
        limit: limit ? +limit : 12,
    }));
};
exports.getProducts = getProducts;
/**
 * Retrieves a curated list of featured products for the home page.
 * @route GET /products/featured
 */
const getFeaturedProducts = async (_req, res) => {
    res.json(await product_service_1.productService.findFeatured());
};
exports.getFeaturedProducts = getFeaturedProducts;
/**
 * Retrieves full details for a single product.
 * @route GET /products/:id
 * @param {string} id - The unique product ID
 */
const getProductById = async (req, res) => {
    const id = parseInt(req.params['id'], 10);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid product id' });
        return;
    }
    const product = await product_service_1.productService.findById(id);
    if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
    }
    res.json(product);
};
exports.getProductById = getProductById;
/**
 * Retrieves the full category hierarchy (Types -> Categories -> SubCategories).
 * Useful for building navigation menus or filter sidebars.
 * @route GET /products/taxonomy
 */
const getTaxonomy = async (_req, res) => {
    res.json(await product_service_1.productService.findTaxonomy());
};
exports.getTaxonomy = getTaxonomy;
