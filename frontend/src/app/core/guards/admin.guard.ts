import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.user();
  if (!user) {
    router.navigate(['/auth/login']);
    return false;
  }

  if ((user as any).role !== 'admin') {
    router.navigate(['/']);
    return false;
  }

  return true;
};