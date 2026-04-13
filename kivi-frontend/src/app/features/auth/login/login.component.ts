import { Component }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterLink }   from '@angular/router';
import { Router }       from '@angular/router';
import { AuthService }  from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email        = '';
  password     = '';
  loading      = false;
  error        = '';
  showPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    this.error   = '';
    this.loading = true;

    this.auth.login(this.email.trim(), this.password).subscribe({
      next: res => {
        this.loading = false;
        // Redirect based on role returned from backend
        this.router.navigate([res.role === 'admin' ? '/admin' : '/']);
      },
      error: err => {
        this.loading = false;
        this.error   = err.error?.error ?? 'Login failed. Please try again.';
      },
    });
  }
}
