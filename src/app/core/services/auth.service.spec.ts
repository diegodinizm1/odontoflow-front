import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

/** Builds an unsigned JWT with the given payload (signature is irrelevant client-side). */
function makeJwt(payload: Record<string, unknown>): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=/g, '');
  return `${b64({ alg: 'HS256' })}.${b64(payload)}.sig`;
}

function validToken(extra: Record<string, unknown> = {}): string {
  return makeJwt({ sub: 'u1', tenant_id: 't1', role: 'DENTIST', email: 'dentist@clinic.com', exp: Math.floor(Date.now() / 1000) + 3600, ...extra });
}

describe('AuthService', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => { store[k] = String(v); },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { for (const k of Object.keys(store)) delete store[k]; },
    });
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('is not authenticated without a token', () => {
    const service = TestBed.inject(AuthService);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.getToken()).toBeNull();
  });

  it('decodes a valid (non-expired) token', () => {
    localStorage.setItem('odontoflow_token', validToken());
    const service = TestBed.inject(AuthService);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.email).toBe('dentist@clinic.com');
    expect(service.currentUser()?.role).toBe('DENTIST');
    expect(service.currentUser()?.sub).toBe('u1');
  });

  it('treats an expired token as not authenticated', () => {
    localStorage.setItem('odontoflow_token', validToken({ exp: Math.floor(Date.now() / 1000) - 60 }));
    const service = TestBed.inject(AuthService);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('login posts credentials and stores the returned token', () => {
    const service = TestBed.inject(AuthService);
    let completed = false;
    service.login({ email: 'dentist@clinic.com', password: 'secret' }).subscribe(() => (completed = true));

    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'dentist@clinic.com', password: 'secret' });
    req.flush({ token: validToken() });

    expect(completed).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.getToken()).not.toBeNull();
  });

  it('registerTenant posts and stores the returned token', () => {
    const service = TestBed.inject(AuthService);
    service.registerTenant({ clinicName: 'C', document: 'd', fullName: 'F', email: 'a@b.com', password: 'secret' }).subscribe();

    const req = http.expectOne(`${environment.apiUrl}/auth/tenant`);
    expect(req.request.method).toBe('POST');
    req.flush({ token: validToken() });

    expect(service.isAuthenticated()).toBe(true);
  });

  it('logout clears the session and redirects to login', () => {
    localStorage.setItem('odontoflow_token', validToken());
    const service = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.getToken()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
