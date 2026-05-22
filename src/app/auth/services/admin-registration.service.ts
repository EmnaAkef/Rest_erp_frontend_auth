import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type RegistrationStatus =
  | 'PENDING'
  | 'PENDING_COMPANY_NOT_FOUND'
  | 'APPROVED'
  | 'REJECTED';

export interface RegistrationRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  profileImageUrl?: string;
  status: RegistrationStatus;
  rejectionReason?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminRegistrationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/admin/registration-requests';

  getAllRequests(): Observable<RegistrationRequest[]> {
    return this.http.get<RegistrationRequest[]>(this.apiUrl);
  }

  getPendingRequests(): Observable<RegistrationRequest[]> {
    return this.http.get<RegistrationRequest[]>(`${this.apiUrl}/pending`);
  }

  approveRequest(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/approve`, null, {
      responseType: 'text',
    });
  }

  rejectRequest(id: number, reason: string): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/reject`, { reason }, {
      responseType: 'text',
    });
  }
}