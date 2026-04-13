import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { AdminService }       from '../../../core/services/admin.service';
import { User }               from '../../../core/models/models';
import { LoadingComponent }   from '../../../shared/components/loading-spinner/loading.component';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './admin-customers.component.html',
  styleUrl: './admin-customers.component.css',
})
export class AdminCustomersComponent implements OnInit {
  customers: User[] = [];
  loading = true;
  search  = '';

  constructor(private adminSvc: AdminService) {}

  ngOnInit(): void {
    this.adminSvc.getAllCustomers().subscribe({
      next: c  => { this.customers = c; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  get filtered(): User[] {
    if (!this.search.trim()) return this.customers;
    const q = this.search.toLowerCase();
    return this.customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }

  toggleLock(customer: User): void {
    const action = customer.isLocked ? 'unlock' : 'lock';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} account for ${customer.name}?`)) return;

    this.adminSvc.toggleLock(customer.id).subscribe({
      next: res => {
        console.log('toggleLock response:', res);
        customer.isLocked = !customer.isLocked;
      },
      error: err => {
        console.error('toggleLock error:', err);
        alert('Failed to update lock status.');
      },
    });
  }
}
