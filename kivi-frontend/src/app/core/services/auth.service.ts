import { Injectable }              from '@angular/core';
import { HttpClient }              from '@angular/common/http';
import { BehaviorSubject, tap, Observable } from 'rxjs';
import { Router }                  from '@angular/router';
import { environment }             from '../../../environments/environment';
import { User, UserRole }          from '../models/models';

interface LoginResponse {
  message: string;
  role: UserRole;
  name: string;
}

interface MeResponse extends User {}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;
  private _user$ = new BehaviorSubject<User | null>(null);
  readonly user$  = this._user$.asObservable();
  private _checked = false;

  constructor(private http: HttpClient,private router: Router) {}

  get currentUser(): User | null { return this._user$.value; }
  get isLoggedIn():  boolean     { return !!this._user$.value; }
  get isAdmin():     boolean     { return this._user$.value?.role === 'admin'; }
  get isCustomer():  boolean     { return this._user$.value?.role === 'customer'; }
  get isChecked():   boolean     { return this._checked; }

  checkSession(): Observable<User> {
    return this.http.get<MeResponse>(`${this.api}/auth/me`).pipe(
      tap({
        next: user => {
          this._user$.next(user);
          this._checked = true;
        },
        error: () => {
          this._user$.next(null);
          this._checked = true;
        },
      }),
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/auth/login`, { email, password }).pipe(
      tap(() => this.checkSession().subscribe()),
    );
  }

  register(payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.api}/auth/register`, payload);
  }

  logout(): void {
    this.http.post(`${this.api}/auth/logout`, {}).subscribe({
      complete: () => {
        this._user$.next(null);
        this.router.navigate(['/']);
      },
    });
  }

  forgotPassword(email: string): Observable<{ code?: number; message: string }> {
    return this.http.post<{ code?: number; message: string }>(
      `${this.api}/auth/forgot-password`, { email },
    );
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.api}/auth/reset-password`, { email, code, newPassword },
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.api}/auth/change-password`, { currentPassword, newPassword },
    );
  }

  updateLocalUser(partial: Partial<User>): void {
    const current = this._user$.value;
    if (current) this._user$.next({ ...current, ...partial });
  }
}
