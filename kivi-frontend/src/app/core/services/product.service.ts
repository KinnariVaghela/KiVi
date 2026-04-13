import { Injectable }  from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable }  from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Product, ProductListResponse, ProductFilters, ProductType,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getImageUrl(imagePath: string | null): string {
    if (!imagePath) return environment.defaultImage;
    return `${environment.imageBaseUrl}/${imagePath}`;
  }

  getProducts(filters: ProductFilters = {}): Observable<ProductListResponse> {
    let params = new HttpParams();

    if (filters.search)        params = params.set('search',        filters.search);
    if (filters.typeId)        params = params.set('typeId',        filters.typeId.toString());
    if (filters.categoryId)    params = params.set('categoryId',    filters.categoryId.toString());
    if (filters.subCategoryId) params = params.set('subCategoryId', filters.subCategoryId.toString());
    if (filters.minPrice != null) params = params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice != null) params = params.set('maxPrice', filters.maxPrice.toString());
    if (filters.inStock)       params = params.set('inStock',       'true');
    if (filters.page)          params = params.set('page',          filters.page.toString());
    if (filters.limit)         params = params.set('limit',         filters.limit.toString());

    return this.http.get<ProductListResponse>(this.api, { params });
  }

  getFeatured(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/featured`);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.api}/${id}`);
  }

  getTaxonomy(): Observable<ProductType[]> {
    return this.http.get<ProductType[]>(`${this.api}/taxonomy/all`);
  }
}
