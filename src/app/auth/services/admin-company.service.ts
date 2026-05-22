import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CompanyOption {
  companyId: number;
  companyKey: number;
  companyName: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminCompanyService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/admin/companies';

  getCompanies(): Observable<CompanyOption[]> {
    return this.http.get<CompanyOption[]>(this.apiUrl);
  }
}