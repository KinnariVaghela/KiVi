import path from 'path';
import fs   from 'fs';

import { AppDataSource }  from '../data-source';
import { Product }        from '../entity/Product';
import { ProductType }    from '../entity/ProductType';
import { Category }       from '../entity/Category';
import { SubCategory }    from '../entity/SubCategory';
import { User, UserRole } from '../entity/User';
import { Order }          from '../entity/Order';
import { sessionStore }   from '../store/sessionStore';
import { AppError }       from '../errors';

const IMAGES_DIR = path.join(__dirname, '../../ProductImages');

export class AdminService {

  /**
   * Fetches all products with full taxonomy relations (SubCategory -> Category -> Type).
   * @returns List of products ordered by newest first.
   */
  async getAllProducts(): Promise<Product[]> {
    return AppDataSource.getRepository(Product)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.subCategory',  'subCategory')
      .leftJoinAndSelect('subCategory.category', 'category')
      .leftJoinAndSelect('category.productType', 'productType')
      .orderBy('product.id', 'DESC')
      .getMany();
  }

  /**
   * Persists a new product to the database.
   * @throws {AppError} 400 if the provided subCategoryId does not exist.
   */
  async createProduct(data: {
    name:           string;
    description?:   string;
    price:          number;
    stock:          number;
    subCategoryId:  number;
    imageFilename?: string;
  }): Promise<Product> {
    const subCat = await AppDataSource.getRepository(SubCategory).findOneBy({ id: data.subCategoryId });
    if (!subCat) throw new AppError('Sub-category not found', 400);

    const repo = AppDataSource.getRepository(Product);
    return repo.save(repo.create({
      name:          data.name,
      description:   data.description || null,
      price:         data.price,
      stock:         data.stock,
      subCategoryId: data.subCategoryId,
      imagePath:     data.imageFilename || null,
    }));
  }

  /**
   * Updates product details. 
   * If a new image is provided, the previous physical file is deleted from the server.
   * @throws {AppError} 404 if product not found.
   */
  async updateProduct(
    id:   number,
    data: {
      name?:          string;
      description?:   string;
      price?:         number;
      stock?:         number;
      subCategoryId?: number;
      imageFilename?: string;
    },
  ): Promise<Product> {
    const repo    = AppDataSource.getRepository(Product);
    const product = await repo.findOneBy({ id });
    if (!product) throw new AppError('Product not found', 404);

    if (data.name)                      product.name        = data.name;
    if (data.description !== undefined) product.description = data.description || null;
    if (data.price  !== undefined)      product.price       = data.price;
    if (data.stock  !== undefined)      product.stock       = data.stock;

    if (data.subCategoryId) {
      const subCat = await AppDataSource.getRepository(SubCategory).findOneBy({ id: data.subCategoryId });
      if (!subCat) throw new AppError('Sub-category not found', 400);
      product.subCategoryId = data.subCategoryId;
    }

    if (data.imageFilename) {
      if (product.imagePath) {
        const old = path.join(IMAGES_DIR, product.imagePath);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      product.imagePath = data.imageFilename;
    }

    return repo.save(product);
  }

  /**
   * Deletes a product from the database and removes its image from the file system.
   */
  async deleteProduct(id: number): Promise<void> {
    const repo    = AppDataSource.getRepository(Product);
    const product = await repo.findOneBy({ id });
    if (!product) throw new AppError('Product not found', 404);

    if (product.imagePath) {
      const img = path.join(IMAGES_DIR, product.imagePath);
      if (fs.existsSync(img)) fs.unlinkSync(img);
    }
    await repo.remove(product);
  }

  /**
   * Creates a new Product Type.
   */
  async createType(name: string): Promise<ProductType> {
    const repo = AppDataSource.getRepository(ProductType);
    return repo.save(repo.create({ name }));
  }

  /**
   * Creates a new Category linked to a Product Type.
   */
  async createCategory(name: string, productTypeId: number): Promise<Category> {
    const repo = AppDataSource.getRepository(Category);
    return repo.save(repo.create({ name, productTypeId }));
  }

  /**
   * Creates a new Sub-Category linked to a Category.
   */
  async createSubCategory(name: string, categoryId: number): Promise<SubCategory> {
    const repo = AppDataSource.getRepository(SubCategory);
    return repo.save(repo.create({ name, categoryId }));
  }

  /**
   * Retrieves all users registered with the 'CUSTOMER' role.
   * Excludes sensitive data like passwords.
   */
  async getAllCustomers(): Promise<User[]> {
    return AppDataSource.getRepository(User).find({
      where:  { role: UserRole.CUSTOMER },
      select: ['id', 'name', 'email', 'phone', 'address', 'isLocked', 'createdAt'],
      order:  { createdAt: 'DESC' },
    });
  }

  /**
   * Updates the lock status of a user. 
   * If locked, all active sessions for that user are immediately invalidated.
   */
  async setLock(id: number, locked: boolean): Promise<User> {
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOneBy({ id });
    if (!user) throw new AppError('User not found', 404);

    user.isLocked = locked;
    await repo.save(user);
    if (locked) sessionStore.deleteAllForUser(user.id);
    return user;
  }

  /**
   * Inverts the current lock status of a user.
   * Triggers session cleanup if the resulting state is 'locked'.
   */
  async toggleLock(id: number): Promise<User> {
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOneBy({ id });
    if (!user) throw new AppError('User not found', 404);

    user.isLocked = !user.isLocked;
    await repo.save(user);

    if (user.isLocked) sessionStore.deleteAllForUser(user.id);

    return user;
  }

  /**
   * Fetches all orders including the purchasing user and item list.
   */
  async getAllOrders(): Promise<Order[]> {
    return AppDataSource.getRepository(Order)
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user',  'user')
      .leftJoinAndSelect('order.items', 'items')
      .orderBy('order.placedAt', 'DESC')
      .getMany();
  }

  /**
   * Fetches a single order by ID with related entities.
   */
  async getOrderById(id: number): Promise<Order | null> {
    return AppDataSource.getRepository(Order)
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user',  'user')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.id = :id', { id })
      .getOne();
  }
}

export const adminService = new AdminService();