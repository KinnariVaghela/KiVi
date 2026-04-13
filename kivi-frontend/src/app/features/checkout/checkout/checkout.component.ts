import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule }        from '@angular/forms';
import { CartService }        from '../../../core/services/cart.service';
import { OrderService }       from '../../../core/services/order.service';
import { ProductService }     from '../../../core/services/product.service';
import { CartItem, PaymentMethod } from '../../../core/models/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  items:   CartItem[]    = [];
  selectedMethod: PaymentMethod | '' = '';
  placing  = false;
  error    = '';

  paymentMethods = [
    { value: 'Credit Card'      as PaymentMethod, label: 'Credit Card',       icon: '💳' },
    { value: 'Debit Card'       as PaymentMethod, label: 'Debit Card',        icon: '🏦' },
    { value: 'Cash on Delivery' as PaymentMethod, label: 'Cash on Delivery',  icon: '💵' },
    { value: 'Bank Transfer'    as PaymentMethod, label: 'Bank Transfer',     icon: '🏛️' },
  ];

  constructor(
    private cartSvc:    CartService,
    private orderSvc:   OrderService,
    private productSvc: ProductService,
    private router:     Router,
  ) {}

  ngOnInit(): void {
    this.cartSvc.cart$.subscribe(cart => this.items = cart.items);
  }

  get total(): number { return this.cartSvc.total; }

  getImage(item: CartItem): string {
    return this.productSvc.getImageUrl(item.product.imagePath);
  }
  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/default-product.svg';
  }

  placeOrder(): void {
    if (!this.selectedMethod) return;
    this.placing = true;
    this.error   = '';

    this.orderSvc.checkout(this.selectedMethod as PaymentMethod).subscribe({
      next: order => {
        this.placing = false;
        this.router.navigate(['/order-confirmation', order.id]);
      },
      error: err => {
        this.placing = false;
        this.error   = err.error?.error ?? 'Checkout failed. Please try again.';
      },
    });
  }
}
