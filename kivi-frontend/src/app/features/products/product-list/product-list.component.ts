import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil, debounceTime, distinctUntilChanged } from "rxjs/operators";
import { ProductService } from "../../../core/services/product.service";
import { CartService } from "../../../core/services/cart.service";
import { AuthService } from "../../../core/services/auth.service";
import {
  Product,
  ProductFilters,
  ProductType,
  CartItem,
} from "../../../core/models/models";
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { LoadingComponent } from "../../../shared/components/loading-spinner/loading.component";

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, LoadingComponent],
  templateUrl: "./product-list.component.html",
  styleUrl: "./product-list.component.css",
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  taxonomy: ProductType[] = [];
  loading = true;
  total = 0;
  totalPages = 1;
  currentPage = 1;
  addingId: number | null = null;
  filtersOpen = false;
  sortBy = "";
  cartItems: CartItem[] = [];

  filters: ProductFilters = { page: 1, limit: 12 };

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private productSvc: ProductService,
    private cartSvc: CartService,
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());

    this.productSvc.getTaxonomy().subscribe((t) => (this.taxonomy = t));

    this.cartSvc.cart$.subscribe((cart) => (this.cartItems = cart.items));

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.filters = {
          search: params["search"] || undefined,
          typeId: params["typeId"] ? +params["typeId"] : undefined,
          categoryId: params["categoryId"] ? +params["categoryId"] : undefined,
          subCategoryId: params["subCategoryId"]
            ? +params["subCategoryId"]
            : undefined,
          minPrice: params["minPrice"] ? +params["minPrice"] : undefined,
          maxPrice: params["maxPrice"] ? +params["maxPrice"] : undefined,
          inStock: params["inStock"] === "true",
          page: params["page"] ? +params["page"] : 1,
          limit: 12,
        };
        this.currentPage = this.filters.page ?? 1;
        this.loadProducts();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get pageTitle(): string {
    if (this.filters.search) return `Results for "${this.filters.search}"`;
    const type = this.taxonomy.find((t) => t.id === this.filters.typeId);
    return type ? type.name : "All Products";
  }

  get currentCategories() {
    if (!this.filters.typeId) return [];
    return (
      this.taxonomy.find((t) => t.id === this.filters.typeId)?.categories ?? []
    );
  }

  get currentSubCategories() {
    if (!this.filters.categoryId) return [];
    return (
      this.currentCategories.find((c) => c.id === this.filters.categoryId)
        ?.subCategories ?? []
    );
  }

  get pageNumbers(): number[] {
    const range = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  onSearchChange(): void {
    this.searchSubject.next(this.filters.search ?? "");
  }

  onTypeChange(): void {
    this.filters.categoryId = undefined;
    this.filters.subCategoryId = undefined;
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.filters.subCategoryId = undefined;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filters.page = 1;
    this.currentPage = 1;
    this.updateQueryParams();
  }

  clearFilters(): void {
    this.filters = { page: 1, limit: 12 };
    this.sortBy = "";
    this.updateQueryParams();
  }

  goPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.filters.page = page;
    this.currentPage = page;
    this.updateQueryParams();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  cartQty(productId: number): number {
    return this.cartItems.find((i) => i.productId === productId)?.quantity ?? 0;
  }

  onDecrease(product: Product): void {
    const item = this.cartItems.find((i) => i.productId === product.id);
    if (!item) return;
    if (item.quantity <= 1) {
      this.cartSvc.removeItem(item.id).subscribe();
    } else {
      this.cartSvc.updateItem(item.id, item.quantity - 1).subscribe();
    }
  }

  private updateQueryParams(): void {
    const q: Record<string, string> = {};
    if (this.filters.search) q["search"] = this.filters.search;
    if (this.filters.typeId) q["typeId"] = String(this.filters.typeId);
    if (this.filters.categoryId)
      q["categoryId"] = String(this.filters.categoryId);
    if (this.filters.subCategoryId)
      q["subCategoryId"] = String(this.filters.subCategoryId);
    if (this.filters.minPrice) q["minPrice"] = String(this.filters.minPrice);
    if (this.filters.maxPrice) q["maxPrice"] = String(this.filters.maxPrice);
    if (this.filters.inStock) q["inStock"] = "true";
    if (this.filters.page && this.filters.page > 1)
      q["page"] = String(this.filters.page);

    this.router.navigate([], { queryParams: q, replaceUrl: true });
  }

  loadProducts(): void {
    this.loading = true;
    this.productSvc.getProducts(this.filters).subscribe({
      next: (res) => {
        let data = res.products;
        if (this.sortBy === "price_asc")
          data = [...data].sort((a, b) => +a.price - +b.price);
        if (this.sortBy === "price_desc")
          data = [...data].sort((a, b) => +b.price - +a.price);
        this.products = data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onAddToCart(product: Product): void {
    const item = this.cartItems.find((i) => i.productId === product.id);
    this.addingId = product.id;
    if (item) {
      this.cartSvc.updateItem(item.id, item.quantity + 1).subscribe({
        complete: () => {
          this.addingId = null;
        },
        error: () => {
          this.addingId = null;
        },
      });
    } else {
      this.cartSvc.addItem(product.id).subscribe({
        complete: () => {
          this.addingId = null;
        },
        error: () => {
          this.addingId = null;
        },
      });
    }
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.typeId ||
      this.filters.categoryId ||
      this.filters.subCategoryId ||
      this.filters.minPrice ||
      this.filters.maxPrice ||
      this.filters.inStock ||
      this.filters.search
    );
  }

  activeFilterCount(): number {
  let count = 0;
  if (this.filters.typeId) count++;
  if (this.filters.categoryId) count++;
  if (this.filters.subCategoryId) count++;
  if (this.filters.minPrice) count++;
  if (this.filters.maxPrice) count++;
  if (this.filters.inStock) count++;
  if (this.filters.search) count++;
  return count;
}

  getTypeName(id: number | string): string {
    return this.taxonomy.find((t) => t.id === id)?.name ?? "";
  }
}
