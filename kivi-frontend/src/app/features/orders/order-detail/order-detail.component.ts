import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderService }       from '../../../core/services/order.service';
import { Order }              from '../../../core/models/models';
import { LoadingComponent }   from '../../../shared/components/loading-spinner/loading.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  error   = '';

  constructor(private orderSvc: OrderService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = +(this.route.snapshot.paramMap.get('id') ?? 0);
    this.orderSvc.getOrderById(id).subscribe({
      next: o  => { this.order = o; this.loading = false; },
      error: () => { this.error = 'Could not load order.'; this.loading = false; },
    });
  }
}
