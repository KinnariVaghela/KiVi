import { Injectable }  from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, PaymentMethod } from '../models/models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  checkout(paymentMethod: PaymentMethod): Observable<Order> {
    return this.http.post<Order>(`${this.api}/checkout`, { paymentMethod });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.api);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.api}/${id}`);
  }
}