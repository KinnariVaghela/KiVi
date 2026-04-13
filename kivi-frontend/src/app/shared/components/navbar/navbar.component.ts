import { Component, OnInit, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive }     from '@angular/router';
import { CommonModule }                     from '@angular/common';
import { FormsModule }                      from '@angular/forms';
import { Router }                           from '@angular/router';
import { AuthService }                      from '../../../core/services/auth.service';
import { CartService }                      from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.component.html', 
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  searchQuery = '';
  isScrolled  = false;
  menuOpen    = false;
  mobileOpen  = false;

  constructor(
    public auth: AuthService,
    public cartSvc: CartService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
      if (user?.role === 'customer') {
        this.cartSvc.loadCart().subscribe();
      } else {
        this.cartSvc.resetCart();
      }
    });
  }

  get cartCount(): number { return this.cartSvc.itemCount; }
  get userInitial(): string {
    return (this.auth.currentUser?.name?.[0] ?? '?').toUpperCase();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchQuery.trim() },
      });
      this.searchQuery = '';
      this.mobileOpen = false;
    }
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }

  logout(): void {
    this.menuOpen = false;
    this.mobileOpen = false;
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    const t = e.target as HTMLElement;
    if (!t.closest('.user-menu')) this.menuOpen = false;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }
}