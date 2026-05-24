import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../auth/services/auth.service';
import {
  AdminCompanyService,
  CompanyOption,
} from '../../auth/services/admin-company.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly adminCompanyService = inject(AdminCompanyService);
  private readonly router = inject(Router);

  user = this.authService.currentUser;

  companies = signal<CompanyOption[]>([]);
  selectedCompanyKey: number | null = null;
  private selectedCompanyKeySubscription?: Subscription;

  isProfileMenuOpen = false;

  ngOnInit(): void {
    this.authService.refreshCurrentUser();
    this.selectedCompanyKey = this.authService.syncSelectedCompanyKeyFromStorage();

    this.selectedCompanyKeySubscription = this.authService.selectedCompanyKey$.subscribe(
      (companyKey) => {
        this.selectedCompanyKey = companyKey;
      },
    );

    if (this.isSuperAdmin()) {
      this.loadCompanies();
    }
  }

  ngOnDestroy(): void {
    this.selectedCompanyKeySubscription?.unsubscribe();
  }

  loadCompanies(): void {
    this.adminCompanyService.getCompanies().subscribe({
      next: (data) => {
        this.companies.set(data);
      },
      error: (error) => {
        console.error('Erreur chargement companies', error);
      },
    });
  }

  isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  canManageRegistrationRequests(): boolean {
    return this.authService.canManageRegistrationRequests();
  }

  onCompanyChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    if (!value) {
      this.authService.setSelectedCompanyKey(null);
      return;
    }

    this.authService.setSelectedCompanyKey(Number(value));
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  getInitial(): string {
    const currentUser = this.user();

    if (!currentUser?.firstName) {
      return 'U';
    }

    return currentUser.firstName.charAt(0).toUpperCase();
  }

  getUserRoleLabel(): string {
    const currentUser = this.user();

    if (!currentUser) {
      return '';
    }

    if (currentUser.role === 'SUPER_ADMIN') {
      return 'Super Admin';
    }

    if (currentUser.role === 'COMPANY_ADMIN') {
      return 'Company Admin';
    }

    return 'User';
  }

  getUserCompanyLabel(): string {
    const currentUser = this.user();

    if (!currentUser) {
      return '';
    }

    if (currentUser.role === 'SUPER_ADMIN') {
      return '';
    }

    return currentUser.companyName;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
