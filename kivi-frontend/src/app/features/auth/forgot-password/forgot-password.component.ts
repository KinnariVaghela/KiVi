import { Component }    from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { RouterLink }   from '@angular/router';
import { Router }       from '@angular/router';
import { HttpClient }   from '@angular/common/http';
import { AuthService }  from '../../../core/services/auth.service';

type Step = 'email' | 'code' | 'password' | 'done';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  step: Step    = 'email';
  email         = '';
  code          = '';
  newPassword   = '';
  resetCode     = '';
  loading       = false;
  error         = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient,
  ) {}

  stepDone(s: Step): boolean {
    const order: Step[] = ['email', 'code', 'password', 'done'];
    return order.indexOf(this.step) > order.indexOf(s);
  }

   requestCode(): void {
    this.error = '';
    this.loading = true;

    this.http.post<any>('/api/auth/forgot-password', { email: this.email.trim().toLowerCase() })
      .subscribe({
        next: res => {
          this.loading = false;
          console.log('forgot-password response:', res); // check browser console

          if (res.code === null || res.code === undefined) {
            this.error = 'Email not found. Make sure you use the exact email you registered with.';
            return;
          }
          this.resetCode = String(res.code);
          this.step = 'code';
        },
        error: err => {
          this.loading = false;
          this.error = err.error?.error ?? 'Could not send reset code.';
        },
      });
  }

  doReset(): void {
    this.error = '';

    if (!this.email.trim()) {
      this.error = 'Email is missing. Please start over.';
      return;
    }
    if (!this.code.trim()) {
      this.error = 'Please enter the reset code.';
      return;
    }
    if (!this.newPassword) {
      this.error = 'Please enter a new password.';
      return;
    }

    this.loading = true;
    this.http.post<{ message: string }>(
      '/api/auth/reset-password',
      {
        email:       this.email.trim().toLowerCase(),
        code:        this.code.trim(),
        newPassword: this.newPassword,
      }
    ).subscribe({
      next: () => { this.loading = false; this.step = 'done'; },
      error: err => {
        this.loading = false;
        this.error   = err.error?.error ?? 'Reset failed. Check your code and try again.';
      },
    });
  }
}
