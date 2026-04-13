import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ProductService } from "../../core/services/product.service";
import { CartService } from "../../core/services/cart.service";
import { AuthService } from "../../core/services/auth.service";
import { Product, ProductType, CartItem } from "../../core/models/models";
import { ProductCardComponent } from "../../shared/components/product-card/product-card.component";
import { LoadingComponent } from "../../shared/components/loading-spinner/loading.component";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ProductCardComponent,
    LoadingComponent
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
  template: ``,
  styles: [``],
})
export class HomeComponent implements OnInit {
  featured: Product[] = [];
  taxonomy: ProductType[] = [];
  loadingFeatured = true;
  loadingTaxonomy = true;
  addingId: number | null = null;
  searchQuery = "";
  cartItems: CartItem[] = [];

  popularTags = [
    "Keyboard",
    "Laptop",
    "Desk",
    "Chair",
    "Notebook",
    "Headphones",
  ];

  ticker = [
    "✦ Free Shipping on orders over ₹999",
    "✦ Curated Quality Products",
    "✦ Secure Checkout",
    "✦ 30-Day Easy Returns",
    "✦ 24/7 Customer Support",
    "✦ Free Shipping on orders over ₹999",
    "✦ Curated Quality Products",
    "✦ Secure Checkout",
    "✦ 30-Day Easy Returns",
    "✦ 24/7 Customer Support",
  ];

  values = [
    {
      key: "secure",
      title: "Secure checkout",
      desc: "Industry-standard encryption protects every transaction you make.",
    },
    {
      key: "delivery",
      title: "Fast delivery",
      desc: "Orders processed promptly with multiple reliable shipping options.",
    },
    {
      key: "returns",
      title: "Easy returns",
      desc: "Hassle-free returns within 30 days of purchase, no questions asked.",
    },
    {
      key: "support",
      title: "24/7 support",
      desc: "Our team is always ready to help with anything you need.",
    },
  ];

  constructor(
    private productSvc: ProductService,
    private cartSvc: CartService,
    public auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cartSvc.cart$.subscribe((cart) => (this.cartItems = cart.items));

    this.productSvc.getFeatured().subscribe({
      next: (data) => {
        this.featured = data;
        this.loadingFeatured = false;
      },
      error: () => {
        this.loadingFeatured = false;
      },
    });

    this.productSvc.getTaxonomy().subscribe({
      next: (data) => {
        this.taxonomy = data;
        this.loadingTaxonomy = false;
      },
      error: () => {
        this.loadingTaxonomy = false;
      },
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim())
      this.router.navigate(["/products"], {
        queryParams: { search: this.searchQuery.trim() },
      });
  }

  onAddToCart(product: Product): void {
    this.addingId = product.id;
    const item = this.cartItems.find((i) => i.productId === product.id);
    const req = item
      ? this.cartSvc.updateItem(item.id, item.quantity + 1)
      : this.cartSvc.addItem(product.id);
    req.subscribe({
      complete: () => {
        this.addingId = null;
      },
      error: () => {
        this.addingId = null;
      },
    });
  }

  cartQty(productId: number): number {
    return this.cartItems.find((i) => i.productId === productId)?.quantity ?? 0;
  }

  onDecrease(product: Product): void {
    const item = this.cartItems.find((i) => i.productId === product.id);
    if (!item) return;
    if (item.quantity <= 1) this.cartSvc.removeItem(item.id).subscribe();
    else this.cartSvc.updateItem(item.id, item.quantity - 1).subscribe();
  }

  getCategoryIcon(name: string): { paths: string; viewBox?: string } {
  const map: Record<string, { paths: string; viewBox?: string }> = {
    electronics: {
      paths: `<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21" stroke-linecap="round"/><line x1="12" y1="17" x2="12" y2="21" stroke-linecap="round"/>`
    },
    stationery: {
      paths: `<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>`
    },
    furniture: {
      paths: `<path d="M4 9V5a1 1 0 011-1h14a1 1 0 011 1v4"/><path d="M2 9h20v5H2z"/><line x1="6" y1="14" x2="6" y2="19" stroke-linecap="round"/><line x1="18" y1="14" x2="18" y2="19" stroke-linecap="round"/>`
    },
    clothing: {
      paths: `<path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 001 .74H6v10a1 1 0 001 1h10a1 1 0 001-1V10h2.15a1 1 0 001-.74l.58-3.57a2 2 0 00-1.35-2.23z"/>`
    },
    sports: {
      paths: `<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20"/><line x1="2" y1="12" x2="22" y2="12"/>`
    },
    books: {
      paths: `<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>`
    },
    food: {
      paths: `<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4" stroke-linecap="round"/><line x1="10" y1="1" x2="10" y2="4" stroke-linecap="round"/><line x1="14" y1="1" x2="14" y2="4" stroke-linecap="round"/>`
    },
    toys: {
      paths: `<path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14.5c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.83 8 21v-5c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><rect x="2" y="10" width="20" height="4" rx="2"/>`
    },
    health: {
      paths: `<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>`
    },
  };
  return map[name.toLowerCase()] ?? {
    paths: `<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`
  };
}
}
