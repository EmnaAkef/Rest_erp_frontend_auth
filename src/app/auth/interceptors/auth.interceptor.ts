import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const token = authService.getAccessToken();
  const currentUser = authService.currentUser() ?? authService.getStoredUser();
  const selectedCompanyKey = authService.getSelectedCompanyKey();

  let headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (currentUser?.role === 'SUPER_ADMIN' && selectedCompanyKey !== null) {
    headers['X-Company-Key'] = String(selectedCompanyKey);
  }

  if (Object.keys(headers).length === 0) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: headers,
  });

  return next(authReq);
};
