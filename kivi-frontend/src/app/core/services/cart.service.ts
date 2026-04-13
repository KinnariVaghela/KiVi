import { Injectable }                          from '@angular/core';
import { HttpClient }                          from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap, of, tap } from 'rxjs';
import { environment }                         from '../../../environments/environment';
import { Cart, CartItem }                      from '../models/models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = `${environment.apiUrl}/cart`;

  private _cart$ = new BehaviorSubject<Cart>({ items: [], total: 0 });
  readonly cart$  = this._cart$.asObservable();

  constructor(private http: HttpClient) {}

  get itemCount(): number {
    return this._cart$.value.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  get total(): number {
    return this._cart$.value.total;
  }

  private computeTotal(items: CartItem[]): number {
    return items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
  }

  private setCart(items: CartItem[]): void {
    this._cart$.next({ items, total: this.computeTotal(items) });
  }

  loadCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.api).pipe(
      tap(items => this.setCart(items)),
    );
  }

  addItem(productId: number, quantity = 1): Observable<CartItem[]> {
    return this.http
      .post<{ message: string; item: CartItem }>(this.api, { productId, quantity })
      .pipe(switchMap(() => this.loadCart()));
  }

  updateItem(itemId: number, quantity: number): Observable<CartItem[]> {
    return this.http
      .patch<{ message: string; item: CartItem }>(`${this.api}/${itemId}`, { quantity })
      .pipe(switchMap(() => this.loadCart()));
  }

  removeItem(itemId: number): Observable<CartItem[]> {
    return this.http
      .delete<{ message: string }>(`${this.api}/${itemId}`)
      .pipe(switchMap(() => this.loadCart()));
  }

  clearCart(): Observable<void> {
    return this.http.delete<{ message: string }>(this.api).pipe(
      tap(() => this.setCart([])),
      switchMap(() => of(undefined as void)),
    );
  }

  resetCart(): void {
    this._cart$.next({ items: [], total: 0 });
  }
}
