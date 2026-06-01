import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterTenantRequest, TokenPayload } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'odontoflow_token';
  private readonly token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  readonly isAuthenticated = computed(() => {
    const t = this.token();
    if (!t) return false;
    const payload = this.decodePayload(t);
    return payload ? payload.exp * 1000 > Date.now() : false;
  });

  readonly currentUser = computed(() => {
    const t = this.token();
    return t ? this.decodePayload(t) : null;
  });

  constructor(private http: HttpClient, private router: Router) {}

  registerTenant(req: RegisterTenantRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/tenant`, req).pipe(
      tap(res => this.saveToken(res.token))
    );
  }

  login(req: LoginRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, req).pipe(
      tap(res => this.saveToken(res.token))
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.token.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.token();
  }

  private saveToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.token.set(token);
  }

  private decodePayload(token: string): TokenPayload | null {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64)) as TokenPayload;
    } catch {
      return null;
    }
  }
}
