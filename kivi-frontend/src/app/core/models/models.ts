export type UserRole = 'customer' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: UserRole;
  isLocked: boolean;
  createdAt: string;
}

export interface ProductType {
  id: number;
  name: string;
  categories: Category[];
}

export interface Category {
  id: number;
  name: string;
  productTypeId: number;             
  productType?: ProductType;         
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
  category?: Category;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imagePath: string | null;
  subCategoryId: number;
  subCategory?: SubCategory;
  createdAt: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  search?: string;
  typeId?: number;
  categoryId?: number;
  subCategoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export type PaymentMethod =
  | 'Credit Card'
  | 'Debit Card'
  | 'Cash on Delivery'
  | 'Bank Transfer';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  product?: Product;
}

export interface Order {
  id: number;
  userId: number;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  placedAt: string;
  items: OrderItem[];
  user?: User;
}

export interface AdminProductPayload {
  name: string;
  description?: string;
  price: number;
  stock: number;
  subCategoryId: number;
}
