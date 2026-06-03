import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Restricts a route to dentists (e.g. finances, team, billing). Receptionists are sent home. */
export const dentistGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.currentUser()?.role === 'DENTIST') return true;

  return router.createUrlTree(['/inicio']);
};
