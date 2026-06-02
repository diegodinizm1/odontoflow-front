import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

/** Builds an unsigned JWT with the given payload (signature is irrelevant client-side). */
function makeJwt(payload: Record<string, unknown>): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=/g, '');
  return `${b64({ alg: 'HS256' })}.${b64(payload)}.sig`;
}

describe('AuthService', () => {
  beforeEach(() => {
    // in-memory localStorage (test env does not provide a complete implementation)
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
  });

  it('is not authenticated without a token', () => {
    const service = TestBed.inject(AuthService);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('decodes a valid (non-expired) token', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem('odontoflow_token', makeJwt({ sub: 'u1', tenant_id: 't1', role: 'DENTIST', email: 'dentist@clinic.com', exp }));

    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.email).toBe('dentist@clinic.com');
    expect(service.currentUser()?.role).toBe('DENTIST');
    expect(service.currentUser()?.sub).toBe('u1');
  });

  it('treats an expired token as not authenticated', () => {
    const exp = Math.floor(Date.now() / 1000) - 60;
    localStorage.setItem('odontoflow_token', makeJwt({ sub: 'u1', tenant_id: 't1', role: 'DENTIST', email: 'a@b.com', exp }));

    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(false);
  });
});
