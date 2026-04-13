import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../shared/models';

export const roleGuard = (requiredRole: UserRole): CanActivateFn => {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);
    const user   = auth.currentUser;

    if (!user) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (user.role !== requiredRole) {
      // Redirect to their own home instead of showing an error
      router.navigate(['/dashboard']);
      return false;
    }

    return true;
  };
};