import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/admin-shell.component').then(m => m.AdminShellComponent),
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      {
        path: 'products',
        loadComponent: () => import('./products/admin-products.component').then(m => m.AdminProductsComponent),
      },
      {
        path: 'customers',
        loadComponent: () => import('./customers/admin-customers.component').then(m => m.AdminCustomersComponent),
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders/admin-order/admin-orders.component').then(m => m.AdminOrdersComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./orders/admin-order-detail/admin-order-detail.component').then(m => m.AdminOrderDetailComponent),
      },
    ],
  },
];
