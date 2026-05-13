import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalesKpiResponse } from '../models/sales-kpi-response';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/bi/sales';

  getSalesKpis(startDate?: string, endDate?: string): Observable<SalesKpiResponse> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<SalesKpiResponse>(`${this.apiUrl}/kpis`, { params });
  }

  getRevenueTrend(startDate?: string, endDate?: string) {
  let params: any = {};

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return this.http.get<any[]>(
    'http://localhost:8080/api/bi/sales/revenue-trend',
    { params }
  );
}

getPipelineDistribution(startDate?: string, endDate?: string) {
  let params = new HttpParams();

  if (startDate) {
    params = params.set('startDate', startDate);
  }

  if (endDate) {
    params = params.set('endDate', endDate);
  }

  return this.http.get<any[]>(
    `${this.apiUrl}/pipeline-distribution`,
    { params }
  );
}

getRecentOrders(startDate?: string, endDate?: string) {
  let params: any = {};

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return this.http.get<any[]>(
    'http://localhost:8080/api/bi/sales/recent-orders',
    { params }
  );
}

getTopSalespersons(startDate?: string, endDate?: string) {
  let params: any = {};

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return this.http.get<any[]>(
    'http://localhost:8080/api/bi/sales/top-salespersons',
    { params }
  );
}

getRevenueByCustomer(startDate?: string, endDate?: string) {
  let params: any = {};

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return this.http.get<any[]>(
    'http://localhost:8080/api/bi/sales/revenue-by-customer',
    { params }
  );
}

getRevenueByProduct(startDate?: string, endDate?: string) {
  let params: any = {};

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return this.http.get<any[]>(
    'http://localhost:8080/api/bi/sales/revenue-by-product',
    { params }
  );
}

getCustomerRetention(startDate?: string, endDate?: string) {
  let params = new HttpParams();

  if (startDate) {
    params = params.set('startDate', startDate);
  }

  if (endDate) {
    params = params.set('endDate', endDate);
  }

  return this.http.get<any[]>(
    `${this.apiUrl}/customer-retention`,
    { params }
  );
}

getHighValueDeals() {
  return this.http.get<any[]>(
    'http://localhost:8080/api/bi/sales/high-value-deals'
  );
}
}