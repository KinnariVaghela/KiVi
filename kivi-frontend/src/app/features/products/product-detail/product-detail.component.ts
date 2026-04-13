import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, CartItem } from '../../../core/models/models';
import { LoadingComponent } from '../../../shared/components/loading-spinner/loading.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  loading = true;
  error = '';
  addingId: number | null = null;
  justAdded = false;
  shared = false;
  shareLabel = 'Share';

  cartItems: CartItem[] = [];
  private cartSub?: Subscription;

  constructor(
    private productSvc: ProductService,
    private cartSvc: CartService,
    public auth: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const id = +(this.route.snapshot.paramMap.get('id') ?? 0);
    
    this.productSvc.getById(id).subscribe({
      next: p => { this.product = p; this.loading = false; },
      error: () => { this.error = 'Product not found.'; this.loading = false; },
    });

    this.cartSub = this.cartSvc.cart$.subscribe(cart => {
      this.cartItems = cart.items;
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  get subCategory() { return this.product?.subCategory ?? null; }
  get category() { return this.subCategory?.category ?? null; }
  get productType() { return this.category?.productType ?? null; }
  get imageUrl(): string { return this.productSvc.getImageUrl(this.product?.imagePath ?? null); }

  get quantity(): number {
    return this.cartItems.find(i => i.productId === this.product?.id)?.quantity ?? 0;
  }

  onAddToCart(product: Product): void {
    const item = this.cartItems.find(i => i.productId === product.id);
    this.addingId = product.id;
    
    const req = item
      ? this.cartSvc.updateItem(item.id, item.quantity + 1)
      : this.cartSvc.addItem(product.id);

    req.subscribe({
      next: () => {
        this.addingId = null;
        this.justAdded = true;
        setTimeout(() => { this.justAdded = false; }, 2500);
      },
      error: () => { this.addingId = null; },
    });
  }

  onDecrease(): void {
    if (!this.product) return;
    const item = this.cartItems.find(i => i.productId === this.product?.id);
    if (!item) return;

    this.addingId = this.product.id;
    const req = item.quantity <= 1
      ? this.cartSvc.removeItem(item.id)
      : this.cartSvc.updateItem(item.id, item.quantity - 1);

    req.subscribe({
      next: () => { this.addingId = null; },
      error: () => { this.addingId = null; }
    });
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/default-product.svg';
  }

  onShare(): void {
    const url = window.location.href;
    const title = this.product?.name ?? 'Product';
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.shareLabel = 'Copied!';
        this.shared = true;
        setTimeout(() => { this.shareLabel = 'Share'; this.shared = false; }, 2500);
      });
    }
  }
}