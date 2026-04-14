"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = exports.AdminService = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const data_source_1 = require("../data-source");
const Product_1 = require("../entity/Product");
const ProductType_1 = require("../entity/ProductType");
const Category_1 = require("../entity/Category");
const SubCategory_1 = require("../entity/SubCategory");
const User_1 = require("../entity/User");
const Order_1 = require("../entity/Order");
const sessionStore_1 = require("../store/sessionStore");
const errors_1 = require("../errors");
const IMAGES_DIR = path_1.default.join(__dirname, '../../ProductImages');
class AdminService {
    /**
     * Fetches all products with full taxonomy relations (SubCategory -> Category -> Type).
     * @returns List of products ordered by newest first.
     */
    async getAllProducts() {
        return data_source_1.AppDataSource.getRepository(Product_1.Product)
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.subCategory', 'subCategory')
            .leftJoinAndSelect('subCategory.category', 'category')
            .leftJoinAndSelect('category.productType', 'productType')
            .orderBy('product.id', 'DESC')
            .getMany();
    }
    /**
     * Persists a new product to the database.
     * @throws {AppError} 400 if the provided subCategoryId does not exist.
     */
    async createProduct(data) {
        const subCat = await data_source_1.AppDataSource.getRepository(SubCategory_1.SubCategory).findOneBy({ id: data.subCategoryId });
        if (!subCat)
            throw new errors_1.AppError('Sub-category not found', 400);
        const repo = data_source_1.AppDataSource.getRepository(Product_1.Product);
        return repo.save(repo.create({
            name: data.name,
            description: data.description || null,
            price: data.price,
            stock: data.stock,
            subCategoryId: data.subCategoryId,
            imagePath: data.imageFilename || null,
        }));
    }
    /**
     * Updates product details.
     * If a new image is provided, the previous physical file is deleted from the server.
     * @throws {AppError} 404 if product not found.
     */
    async updateProduct(id, data) {
        const repo = data_source_1.AppDataSource.getRepository(Product_1.Product);
        const product = await repo.findOneBy({ id });
        if (!product)
            throw new errors_1.AppError('Product not found', 404);
        if (data.name)
            product.name = data.name;
        if (data.description !== undefined)
            product.description = data.description || null;
        if (data.price !== undefined)
            product.price = data.price;
        if (data.stock !== undefined)
            product.stock = data.stock;
        if (data.subCategoryId) {
            const subCat = await data_source_1.AppDataSource.getRepository(SubCategory_1.SubCategory).findOneBy({ id: data.subCategoryId });
            if (!subCat)
                throw new errors_1.AppError('Sub-category not found', 400);
            product.subCategoryId = data.subCategoryId;
        }
        if (data.imageFilename) {
            if (product.imagePath) {
                const old = path_1.default.join(IMAGES_DIR, product.imagePath);
                if (fs_1.default.existsSync(old))
                    fs_1.default.unlinkSync(old);
            }
            product.imagePath = data.imageFilename;
        }
        return repo.save(product);
    }
    /**
     * Deletes a product from the database and removes its image from the file system.
     */
    async deleteProduct(id) {
        const repo = data_source_1.AppDataSource.getRepository(Product_1.Product);
        const product = await repo.findOneBy({ id });
        if (!product)
            throw new errors_1.AppError('Product not found', 404);
        if (product.imagePath) {
            const img = path_1.default.join(IMAGES_DIR, product.imagePath);
            if (fs_1.default.existsSync(img))
                fs_1.default.unlinkSync(img);
        }
        await repo.remove(product);
    }
    /**
     * Creates a new Product Type.
     */
    async createType(name) {
        const repo = data_source_1.AppDataSource.getRepository(ProductType_1.ProductType);
        return repo.save(repo.create({ name }));
    }
    /**
     * Creates a new Category linked to a Product Type.
     */
    async createCategory(name, productTypeId) {
        const repo = data_source_1.AppDataSource.getRepository(Category_1.Category);
        return repo.save(repo.create({ name, productTypeId }));
    }
    /**
     * Creates a new Sub-Category linked to a Category.
     */
    async createSubCategory(name, categoryId) {
        const repo = data_source_1.AppDataSource.getRepository(SubCategory_1.SubCategory);
        return repo.save(repo.create({ name, categoryId }));
    }
    /**
     * Retrieves all users registered with the 'CUSTOMER' role.
     * Excludes sensitive data like passwords.
     */
    async getAllCustomers() {
        return data_source_1.AppDataSource.getRepository(User_1.User).find({
            where: { role: User_1.UserRole.CUSTOMER },
            select: ['id', 'name', 'email', 'phone', 'address', 'isLocked', 'createdAt'],
            order: { createdAt: 'DESC' },
        });
    }
    /**
     * Updates the lock status of a user.
     * If locked, all active sessions for that user are immediately invalidated.
     */
    async setLock(id, locked) {
        const repo = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = await repo.findOneBy({ id });
        if (!user)
            throw new errors_1.AppError('User not found', 404);
        user.isLocked = locked;
        await repo.save(user);
        if (locked)
            sessionStore_1.sessionStore.deleteAllForUser(user.id);
        return user;
    }
    /**
     * Inverts the current lock status of a user.
     * Triggers session cleanup if the resulting state is 'locked'.
     */
    async toggleLock(id) {
        const repo = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = await repo.findOneBy({ id });
        if (!user)
            throw new errors_1.AppError('User not found', 404);
        user.isLocked = !user.isLocked;
        await repo.save(user);
        if (user.isLocked)
            sessionStore_1.sessionStore.deleteAllForUser(user.id);
        return user;
    }
    /**
     * Fetches all orders including the purchasing user and item list.
     */
    async getAllOrders() {
        return data_source_1.AppDataSource.getRepository(Order_1.Order)
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('order.items', 'items')
            .orderBy('order.placedAt', 'DESC')
            .getMany();
    }
    /**
     * Fetches a single order by ID with related entities.
     */
    async getOrderById(id) {
        return data_source_1.AppDataSource.getRepository(Order_1.Order)
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.user', 'user')
            .leftJoinAndSelect('order.items', 'items')
            .where('order.id = :id', { id })
            .getOne();
    }
}
exports.AdminService = AdminService;
exports.adminService = new AdminService();
