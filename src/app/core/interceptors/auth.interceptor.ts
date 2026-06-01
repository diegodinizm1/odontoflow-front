import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();

  // Only attach our JWT to our own API. Pre-signed storage URLs (MinIO/S3)
  // carry their own signature and must NOT receive an Authorization header.
  const isApiCall = req.url.startsWith(environment.apiUrl);

  if (token && isApiCall) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req);
};
