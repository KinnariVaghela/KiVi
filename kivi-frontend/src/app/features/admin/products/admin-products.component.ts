import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { AdminService }       from '../../../core/services/admin.service';
import { ProductService }     from '../../../core/services/product.service';
import { Product, ProductType } from '../../../core/models/models';
import { LoadingComponent }   from '../../../shared/components/loading-spinner/loading.component';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css',
})
export class AdminProductsComponent implements OnInit {
  products: Product[]     = [];
  taxonomy: ProductType[] = [];
  loading  = true;
  saving   = false;
  showModal = false;
  formError = '';
  editingId: number | null = null;
  selectedFile: File | null = null;
  imagePreview = '';
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  selectedTypeId:        number | null = null;
  selectedCategoryId:    number | null = null;

  form = {
    name: '', description: '', price: 0, stock: 0, subCategoryId: null as number | null,
  };

  newTypeName        = '';
  newCategoryName    = '';
  newSubCategoryName = '';

  constructor(
    private adminSvc:   AdminService,
    private productSvc: ProductService,
  ) {}

  ngOnInit(): void {
    this.load();
    this.productSvc.getTaxonomy().subscribe(t => this.taxonomy = t);
  }

  load(): void {
    this.loading = true;
    this.adminSvc.getAllProducts().subscribe({
      next: p  => { this.products = p; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  get selectedCategories() {
    return this.taxonomy.find(t => t.id === this.selectedTypeId)?.categories ?? [];
  }
  get selectedSubCategories() {
    return this.selectedCategories.find(c => c.id === this.selectedCategoryId)?.subCategories ?? [];
  }

  onTypeChange(): void { this.selectedCategoryId = null; this.form.subCategoryId = null; }
  onCategoryChange(): void { this.form.subCategoryId = null; }

  getImg(p: Product): string { return this.productSvc.getImageUrl(p.imagePath); }
  onImgError(e: Event): void { (e.target as HTMLImageElement).src = '/assets/default-product.svg'; }

  openCreate(): void {
    this.editingId = null;
    this.form = { name: '', description: '', price: 0, stock: 0, subCategoryId: null };
    this.selectedFile = null;
    this.imagePreview = '';
    this.formError = '';
    this.showModal = true;
    setTimeout(() => {
      if (this.fileInputRef?.nativeElement) this.fileInputRef.nativeElement.value = '';
    }, 50);
  }

  openEdit(p: Product): void {
    this.editingId = p.id;
    this.form = {
      name: p.name, description: p.description ?? '',
      price: +p.price, stock: p.stock, subCategoryId: p.subCategoryId,
    };
    this.selectedFile = null;
    this.imagePreview = this.getImg(p);
    this.formError = '';
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = e => { this.imagePreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  saveProduct(): void {
    if (!this.form.name || !this.form.subCategoryId) {
      this.formError = 'Name and Sub-Category are required.';
      return;
    }
    this.saving = true;
    this.formError = '';

    const fd = new FormData();
    fd.append('name',          this.form.name);
    fd.append('description',   this.form.description);
    fd.append('price',         String(this.form.price));
    fd.append('stock',         String(this.form.stock));
    fd.append('subCategoryId', String(this.form.subCategoryId));

    const fileFromInput = this.fileInputRef?.nativeElement?.files?.[0];
    const fileToUpload  = fileFromInput ?? this.selectedFile ?? null;
    if (fileToUpload) {
      fd.append('image', fileToUpload, fileToUpload.name);
    }

    console.log('Uploading file:', fileToUpload?.name ?? 'none'); // remove after testing

    const req = this.editingId
      ? this.adminSvc.updateProduct(this.editingId, fd)
      : this.adminSvc.createProduct(fd);

    req.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.load(); },
      error: err => { this.saving = false; this.formError = err.error?.error ?? 'Save failed.'; },
    });
  }

  deleteProduct(p: Product): void {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    this.adminSvc.deleteProduct(p.id).subscribe({ next: () => this.load() });
  }

  createType(): void {
    if (!this.newTypeName.trim()) return;
    this.adminSvc.createType(this.newTypeName.trim()).subscribe({
      next: () => { this.newTypeName = ''; this.productSvc.getTaxonomy().subscribe(t => this.taxonomy = t); },
    });
  }
  createCategory(): void {
    if (!this.newCategoryName.trim() || !this.selectedTypeId) return;
    this.adminSvc.createCategory(this.newCategoryName.trim(), this.selectedTypeId).subscribe({
      next: () => { this.newCategoryName = ''; this.productSvc.getTaxonomy().subscribe(t => this.taxonomy = t); },
    });
  }
  createSubCategory(): void {
    if (!this.newSubCategoryName.trim() || !this.selectedCategoryId) return;
    this.adminSvc.createSubCategory(this.newSubCategoryName.trim(), this.selectedCategoryId).subscribe({
      next: () => { this.newSubCategoryName = ''; this.productSvc.getTaxonomy().subscribe(t => this.taxonomy = t); },
    });
  }
}
