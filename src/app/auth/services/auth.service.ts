import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;

  email: string;
  firstName: string;
  lastName: string;

  companyId: number;
  companyKey: number;
  companyName: string;

  role: string;
  profileImageUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);

  currentUser = signal<AuthResponse | null>(this.getStoredUser());

  private selectedCompanyKeySubject = new BehaviorSubject<number | null>(
    this.getSelectedCompanyKey()
  );

  selectedCompanyKey$ = this.selectedCompanyKeySubject.asObservable();

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => {
        this.saveAuthData(response);
      })
    );
  }

  register(formData: FormData) {
    return this.http.post(`${this.apiUrl}/register`, formData, {
      responseType: 'text',
    });
  }

  private saveAuthData(response: AuthResponse): void {
    if (!this.isBrowser()) {
      return;
    }

    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(response));

    this.currentUser.set(response);
  }

  getAccessToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return localStorage.getItem('accessToken');
  }

  getStoredUser(): AuthResponse | null {
    if (!this.isBrowser()) {
      return null;
    }

    const user = localStorage.getItem('currentUser');

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as AuthResponse;
    } catch {
      return null;
    }
  }

  refreshCurrentUser(): void {
    const user = this.getStoredUser();
    this.currentUser.set(user);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  isSuperAdmin(): boolean {
    return this.currentUser()?.role === 'SUPER_ADMIN';
  }

  isCompanyAdmin(): boolean {
    return this.currentUser()?.role === 'COMPANY_ADMIN';
  }

  isUser(): boolean {
    return this.currentUser()?.role === 'USER';
  }

  canManageRegistrationRequests(): boolean {
    const role = this.currentUser()?.role;
    return role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN';
  }

  setSelectedCompanyKey(companyKey: number | null): void {
    if (!this.isBrowser()) {
      this.selectedCompanyKeySubject.next(companyKey);
      return;
    }

    if (companyKey === null) {
      localStorage.removeItem('selectedCompanyKey');
      this.selectedCompanyKeySubject.next(null);
      return;
    }

    localStorage.setItem('selectedCompanyKey', String(companyKey));
    this.selectedCompanyKeySubject.next(companyKey);
  }

  getSelectedCompanyKey(): number | null {
    if (!this.isBrowser()) {
      return null;
    }

    const value = localStorage.getItem('selectedCompanyKey');

    if (!value) {
      return null;
    }

    const companyKey = Number(value);

    return Number.isNaN(companyKey) ? null : companyKey;
  }

  syncSelectedCompanyKeyFromStorage(): number | null {
    const companyKey = this.getSelectedCompanyKey();
    this.selectedCompanyKeySubject.next(companyKey);
    return companyKey;
  }

  clearSelectedCompanyKey(): void {
    if (!this.isBrowser()) {
      this.selectedCompanyKeySubject.next(null);
      return;
    }

    localStorage.removeItem('selectedCompanyKey');
    this.selectedCompanyKeySubject.next(null);
  }

  logout(): void {
    if (!this.isBrowser()) {
      return;
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedCompanyKey');

    this.currentUser.set(null);
    this.selectedCompanyKeySubject.next(null);
  }

  canLoadCompanyDashboard(): boolean {
    const user = this.currentUser();

    if (!user) {
      return false;
    }

    if (user.role === 'USER' || user.role === 'COMPANY_ADMIN') {
      return true;
    }

    if (user.role === 'SUPER_ADMIN') {
      return this.getSelectedCompanyKey() !== null;
    }

    return false;
  }
}
