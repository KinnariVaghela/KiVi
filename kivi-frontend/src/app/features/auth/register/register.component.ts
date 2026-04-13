import { Component }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterLink }   from '@angular/router';
import { Router }       from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  form = { name: '', email: '', password: '', phone: '', address: '' };
  errors: Record<string, string> = {};
  loading = false;
  error   = '';
  success = '';
  showPw  = false;

  constructor(private auth: AuthService, private router: Router) {}

  private validate(): boolean {
    this.errors = {};

    if (!this.form.name.trim())
      this.errors['name'] = 'Name is required.';

    if (!this.form.email.trim())
      this.errors['email'] = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email))
      this.errors['email'] = 'Enter a valid email address.';

    if (!this.form.password)
      this.errors['password'] = 'Password is required.';
    else if (this.form.password.length < 6)
      this.errors['password'] = 'Password must be at least 6 characters.';

    if (!this.form.phone.trim())
      this.errors['phone'] = 'Phone number is required.';

    if (!this.form.address.trim())
      this.errors['address'] = 'Delivery address is required.';

    return Object.keys(this.errors).length === 0;
  }

  onSubmit(): void {
    this.error = '';
    if (!this.validate()) return;

    this.loading = true;

    this.auth.register(this.form).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Account created! Redirecting to sign in...';
        setTimeout(() => this.router.navigate(['/auth/login']), 1800);
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.error ?? 'Registration failed. Please try again.';
      },
    });
  }
}