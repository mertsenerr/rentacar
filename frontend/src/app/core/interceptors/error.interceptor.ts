// ═══════════════════════════════════════════════════════════════════════════════
// CORPORATE ELITE - ERROR INTERCEPTOR
// Global HTTP Error Handling
// ═══════════════════════════════════════════════════════════════════════════════

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          // Unauthorized - redirect to login
          authService.logout();
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.url }
          });
          break;
        case 403:
          // Forbidden
          router.navigate(['/error/forbidden']);
          break;
        case 404:
          // Not found
          // Let component handle this
          break;
        case 500:
          // Server error
          console.error('Server error:', error);
          break;
        default:
          console.error('HTTP error:', error);
      }

      return throwError(() => error);
    })
  );
};
