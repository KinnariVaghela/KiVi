import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { RouterLink }         from '@angular/router';
import { AdminService }       from '../../../../core/services/admin.service';
import { Order }              from '../../../../core/models/models';
import { LoadingComponent }   from '../../../../shared/components/loading-spinner/loading.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css',
})
export class AdminOrdersComponent implements OnInit {
  orders:  Order[] = [];
  loading  = true;

  constructor(private adminSvc: AdminService) {}

  ngOnInit(): void {
    this.adminSvc.getAllOrders().subscribe({
      next: o  => { this.orders = o; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }
}
