"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = exports.ProductService = void 0;
const data_source_1 = require("../data-source");
const Product_1 = require("../entity/Product");
const ProductType_1 = require("../entity/ProductType");
class ProductService {
    /**
     * Performs a paginated search for products based on various filters.
     * Dynamically constructs a TypeORM QueryBuilder based on provided filter keys.
     * @param filters - An object containing search terms, price ranges, and category IDs.
     * @returns A paginated response containing products, count, and metadata.
     */
    async findAll(filters) {
        const page = Math.max(1, filters.page ?? 1);
        const limit = Math.min(50, Math.max(1, filters.limit ?? 12));
        const skip = (page - 1) * limit;
        const qb = data_source_1.AppDataSource.getRepository(Product_1.Product)
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.subCategory', 'subCategory')
            .leftJoinAndSelect('subCategory.category', 'category')
            .leftJoinAndSelect('category.productType', 'productType');
        if (filters.search) {
            const term = `%${filters.search.trim()}%`;
            qb.andWhere('(product.name LIKE :term OR product.description LIKE :term)', { term });
        }
        if (filters.subCategoryId) {
            qb.andWhere('subCategory.id = :subCategoryId', { subCategoryId: filters.subCategoryId });
        }
        else if (filters.categoryId) {
            qb.andWhere('category.id = :categoryId', { categoryId: filters.categoryId });
        }
        else if (filters.typeId) {
            qb.andWhere('productType.id = :typeId', { typeId: filters.typeId });
        }
        if (filters.minPrice !== undefined) {
            qb.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
        }
        if (filters.maxPrice !== undefined) {
            qb.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
        }
        if (filters.inStock) {
            qb.andWhere('product.stock > 0');
        }
        const [products, total] = await qb
            .orderBy('product.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    /**
     * Retrieves the 8 most recently added products that are currently in stock.
     * Typically used for home-page carousels.
     */
    async findFeatured() {
        return data_source_1.AppDataSource.getRepository(Product_1.Product)
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.subCategory', 'subCategory')
            .leftJoinAndSelect('subCategory.category', 'category')
            .leftJoinAndSelect('category.productType', 'productType')
            .where('product.stock > 0')
            .orderBy('product.createdAt', 'DESC')
            .take(8)
            .getMany();
    }
    /**
     * Retrieves full details for a single product, including its full taxonomy path.
     */
    async findById(id) {
        return data_source_1.AppDataSource.getRepository(Product_1.Product)
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.subCategory', 'subCategory')
            .leftJoinAndSelect('subCategory.category', 'category')
            .leftJoinAndSelect('category.productType', 'productType')
            .where('product.id = :id', { id })
            .getOne();
    }
    /**
     * Retrieves the full nested taxonomy tree (Types -> Categories -> SubCategories).
     * Result is sorted alphabetically at every level.
     */
    async findTaxonomy() {
        return data_source_1.AppDataSource.getRepository(ProductType_1.ProductType)
            .createQueryBuilder('t')
            .leftJoinAndSelect('t.categories', 'c')
            .leftJoinAndSelect('c.subCategories', 's')
            .orderBy('t.name')
            .addOrderBy('c.name')
            .addOrderBy('s.name')
            .getMany();
    }
}
exports.ProductService = ProductService;
exports.productService = new ProductService();
