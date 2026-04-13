import { Routes } from '@angular/router';
import { customerGuard, adminGuard } from './core/guards/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.authRoutes),
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./features/products/products.routes').then(m => m.productRoutes),
  },
  {
    path: 'cart',
    canActivate: [customerGuard],
    loadComponent: () =>
      import('./features/cart/cart.component').then(m => m.CartComponent),
  },
  {
    path: 'checkout',
    canActivate: [customerGuard],
    loadComponent: () =>
      import('./features/checkout/checkout/checkout.component').then(m => m.CheckoutComponent),
  },
  {
    path: 'order-confirmation/:id',
    canActivate: [customerGuard],
    loadComponent: () =>
      import('./features/checkout/order-confirm/order-confirmation.component').then(m => m.OrderConfirmationComponent),
  },
  {
    path: 'orders',
    canActivate: [customerGuard],
    loadChildren: () =>
      import('./features/orders/orders.routes').then(m => m.orderRoutes),
  },
  {
    path: 'profile',
    canActivate: [customerGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.adminRoutes),
  },
  {
    path: '**',
    redirectTo: '',
  },
];