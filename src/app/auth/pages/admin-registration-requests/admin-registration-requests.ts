import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  AdminRegistrationService,
  RegistrationRequest,
} from '../../services/admin-registration.service';

@Component({
  selector: 'app-admin-registration-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-registration-requests.html',
  styleUrl: './admin-registration-requests.css',
})
export class AdminRegistrationRequestsComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly adminRegistrationService = inject(AdminRegistrationService);

  requests = signal<RegistrationRequest[]>([]);
  loading = signal(false);
  actionLoadingId = signal<number | null>(null);

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  selectedStatus = 'ALL';

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadRequests();
  }

  loadRequests(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.adminRegistrationService.getAllRequests().subscribe({
      next: (data) => {
        this.requests.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error?.error || 'Erreur lors du chargement des demandes.');
        this.loading.set(false);
      },
    });
  }

  filteredRequests(): RegistrationRequest[] {
    if (this.selectedStatus === 'ALL') {
      return this.requests();
    }

    return this.requests().filter((request) => request.status === this.selectedStatus);
  }

  approve(request: RegistrationRequest): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.actionLoadingId.set(request.id);

    this.adminRegistrationService.approveRequest(request.id).subscribe({
      next: (message) => {
        this.successMessage.set(message);
        this.actionLoadingId.set(null);
        this.loadRequests();
      },
      error: (error) => {
        this.errorMessage.set(error?.error || 'Erreur lors de l’approbation.');
        this.actionLoadingId.set(null);
      },
    });
  }

  reject(request: RegistrationRequest): void {
    const reason = prompt('Raison du rejet :');

    if (reason === null) {
      return;
    }

    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.actionLoadingId.set(request.id);

    this.adminRegistrationService.rejectRequest(request.id, reason).subscribe({
      next: (message) => {
        this.successMessage.set(message);
        this.actionLoadingId.set(null);
        this.loadRequests();
      },
      error: (error) => {
        this.errorMessage.set(error?.error || 'Erreur lors du rejet.');
        this.actionLoadingId.set(null);
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'PENDING_COMPANY_NOT_FOUND':
        return 'status-warning';
      case 'APPROVED':
        return 'status-approved';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return '';
    }
  }

  getPhotoUrl(request: RegistrationRequest): string | null {
    if (!request.profileImageUrl) {
      return null;
    }

    return `http://localhost:8080${request.profileImageUrl}`;
  }

  getInitial(request: RegistrationRequest): string {
    return request.firstName?.charAt(0)?.toUpperCase() || 'U';
  }
}