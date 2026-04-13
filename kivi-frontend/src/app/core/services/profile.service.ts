import { Injectable }  from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { environment } from '../../../environments/environment';
import { User }        from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(this.api);
  }

  updateProfile(payload: { name?: string; email?: string; phone?: string; address?: string }): Observable<User> {
    return this.http.patch<User>(this.api, payload);
  }
}
