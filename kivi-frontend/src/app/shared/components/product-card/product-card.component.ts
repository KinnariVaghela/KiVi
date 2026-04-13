import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterLink }     from '@angular/router';
import { Product }        from '../../../core/models/models';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() showAddToCart = false;
  @Input() adding = false;
  @Input() quantity = 0;                
  @Output() addToCart = new EventEmitter<Product>();
  @Output() decrease  = new EventEmitter<Product>(); // − button

  constructor(private productSvc: ProductService) {}

  get imageUrl(): string { return this.productSvc.getImageUrl(this.product.imagePath); }

  get categoryPath(): string {
    const sub = this.product.subCategory;
    if (!sub) return '';
    const cat = sub.category;
    return cat ? `${cat.name} / ${sub.name}` : sub.name;
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = '/assets/default-product.svg';
  }
}