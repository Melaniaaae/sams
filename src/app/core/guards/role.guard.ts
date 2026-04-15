import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (requiredRole: 'student' | 'coordinator'): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const user = auth.currentUser;

    // 🔒 Not logged in → go to login
    if (!user) {
      router.navigateByUrl('/auth/login');
      return false;
    }

    // ❌ Wrong role → redirect to correct dashboard
    if (user.role !== requiredRole) {
      if (user.role === 'coordinator') {
        router.navigateByUrl('/coordinator-dashboard');
      } else {
        router.navigateByUrl('/dashboard');
      }
      return false;
    }

    // ✅ Correct role → allow access
    return true;
  };
};