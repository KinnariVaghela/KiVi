import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AdminService }       from '../../../../core/services/admin.service';
import { Order }              from '../../../../core/models/models';
import { LoadingComponent }   from '../../../../shared/components/loading-spinner/loading.component';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  templateUrl: './admin-order-detail.component.html',
  styleUrl: './admin-order-detail.component.css',
})
export class AdminOrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  error   = '';

  constructor(private adminSvc: AdminService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = +(this.route.snapshot.paramMap.get('id') ?? 0);
    this.adminSvc.getOrderById(id).subscribe({
      next: o  => { this.order = o; this.loading = false; },
      error: () => { this.error = 'Could not load order.'; this.loading = false; },
    });
  }
}
