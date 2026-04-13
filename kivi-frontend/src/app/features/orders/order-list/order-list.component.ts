import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { RouterLink }         from '@angular/router';
import { OrderService }       from '../../../core/services/order.service';
import { Order }              from '../../../core/models/models';
import { LoadingComponent }   from '../../../shared/components/loading-spinner/loading.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  templateUrl: './order-list.component.html',
  styles: [`
    .page-content { padding-top: calc(var(--nav-height) + 40px); padding-bottom: 80px; }
    .page-header { margin-bottom: 32px; }
  `],
})
export class OrderListComponent implements OnInit {
  orders:  Order[] = [];
  loading  = true;

  constructor(private orderSvc: OrderService) {}

  ngOnInit(): void {
    this.orderSvc.getOrders().subscribe({
      next: o  => { this.orders = o; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
