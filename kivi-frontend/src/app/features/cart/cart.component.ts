import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { RouterLink }         from '@angular/router';
import { CartService }        from '../../core/services/cart.service';
import { ProductService }     from '../../core/services/product.service';
import { CartItem }           from '../../core/models/models';
import { LoadingComponent }   from '../../shared/components/loading-spinner/loading.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  items:   CartItem[] = [];
  loading  = true;

  constructor(
    private cartSvc:    CartService,
    private productSvc: ProductService,
  ) {}

  ngOnInit(): void {
    this.cartSvc.cart$.subscribe(cart => {
      this.items   = cart.items;
      this.loading = false;
    });
    this.cartSvc.loadCart().subscribe({ error: () => { this.loading = false; } });
  }

  get total(): number { return this.cartSvc.total; }

  getImage(item: CartItem): string {
    return this.productSvc.getImageUrl(item.product.imagePath);
  }
  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/default-product.svg';
  }

  changeQty(item: CartItem, delta: number): void {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    this.cartSvc.updateItem(item.id, newQty).subscribe();
  }

  removeItem(item: CartItem): void {
    this.cartSvc.removeItem(item.id).subscribe();
  }

  clearCart(): void {
    if (confirm('Remove all items from cart?')) {
      this.cartSvc.clearCart().subscribe();
    }
  }
}
