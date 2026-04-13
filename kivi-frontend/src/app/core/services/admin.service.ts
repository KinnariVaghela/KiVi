import { Injectable }  from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, Order, User, Category, SubCategory } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = `${environment.apiUrl}/admin`;
  private opts = { withCredentials: true };

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/products`, this.opts);
  }

  createProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(`${this.api}/products`, formData, this.opts);
  }

  updateProduct(id: number, formData: FormData): Observable<Product> {
    return this.http.patch<Product>(`${this.api}/products/${id}`, formData, this.opts);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/products/${id}`, this.opts);
  }

  createType(name: string): Observable<{ id: number; name: string }> {
    return this.http.post<{ id: number; name: string }>(`${this.api}/types`, { name }, this.opts);
  }

  createCategory(name: string, typeId: number): Observable<Category> {
    return this.http.post<Category>(`${this.api}/categories`, { name, productTypeId: typeId }, this.opts);
  }

  createSubCategory(name: string, categoryId: number): Observable<SubCategory> {
    return this.http.post<SubCategory>(`${this.api}/subcategories`, { name, categoryId }, this.opts);
  }

  getAllCustomers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/customers`, this.opts);
  }

  toggleLock(customerId: number): Observable<{ isLocked: boolean; message: string }> {
    return this.http.patch<{ isLocked: boolean; message: string }>(
      `${this.api}/customers/${customerId}/lock`, {}, this.opts,
    );
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.api}/orders`, this.opts);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.api}/orders/${id}`, this.opts);
  }
}