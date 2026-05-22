import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  authService.refreshCurrentUser();

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (authService.canManageRegistrationRequests()) {
    return true;
  }

  return router.createUrlTree(['/overview']);
};