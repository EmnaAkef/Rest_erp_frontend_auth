import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalesKpiResponse } from '../models/sales-kpi-response';

export interface SalesFilters {
  customerName?: string | null;
  productKey?: number | null;
  salespersonKey?: number | null;
  workstatusLabel?: string | null;
  customerCategory?: string | null;
  productCategory?: string | null;
}

export interface SalesFilterOption {
  value: any;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/bi/sales';

  private buildParams(
    startDate?: string,
    endDate?: string,
    filters?: SalesFilters
  ): HttpParams {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    if (filters?.customerName) {
      params = params.set('customerName', filters.customerName);
    }

    if (filters?.productKey !== null && filters?.productKey !== undefined) {
      params = params.set('productKey', filters.productKey.toString());
    }

    if (filters?.salespersonKey !== null && filters?.salespersonKey !== undefined) {
      params = params.set('salespersonKey', filters.salespersonKey.toString());
    }

    if (filters?.workstatusLabel) {
      params = params.set('workstatusLabel', filters.workstatusLabel);
    }

    if (filters?.customerCategory) {
      params = params.set('customerCategory', filters.customerCategory);
    }

    if (filters?.productCategory) {
      params = params.set('productCategory', filters.productCategory);
    }

    return params;
  }

  getSalesKpis(
    startDate?: string,
    endDate?: string,
    filters?: SalesFilters
  ): Observable<SalesKpiResponse> {
    const params = this.buildParams(startDate, endDate, filters);

    return this.http.get<SalesKpiResponse>(`${this.apiUrl}/kpis`, { params });
  }

  getRevenueTrend(
    startDate?: string,
    endDate?: string,
    filters?: SalesFilters
  ): Observable<any[]> {
    const params = this.buildParams(startDate, endDate, filters);

    return this.http.get<any[]>(`${this.apiUrl}/revenue-trend`, { params });
  }

  getPipelineDistribution(
    startDate?: string,
    endDate?: string,
    filters?: SalesFilters
  ): Observable<any[]> {
    const params = this.buildParams(startDate, endDate, filters);

    return this.http.get<any[]>(`${this.apiUrl}/pipeline-distribution`, { params });
  }

  getRecentOrders(
    startDate?: string,
    endDate?: string,
    filters?: SalesFilters
  ): Observable<any[]> {
    const params = this.buildParams(startDate, endDate, filters);

    return this.http.get<any[]>(`${this.apiUrl}/recent-orders`, { params });
  }

  getTopSalespersons(
    startDate?: string,
    endDate?: string,
    filters?: SalesFilters
  ): Observable<any[]> {
    const params = this.buildParams(startDate, endDate, filters);

    return this.http.get<any[]>(`${this.apiUrl}/top-salespersons`, { params });
  }

  getRevenueByCustomer(
    startDate?: string,
    endDate?: string,
    filters?: SalesFilters
  ): Observable<any[]> {
    const params = this.buildParams(startDate, endDate, filters);

    return this.http.get<any[]>(`${this.apiUrl}/revenue-by-customer`, { params });
  }

  getRevenueByProduct(
    startDate?: string,
    endDate?: string,
    filters?: SalesFilters
  ): Observable<any[]> {
    const params = this.buildParams(startDate, endDate, filters);

    return this.http.get<any[]>(`${this.apiUrl}/revenue-by-product`, { params });
  }

  getCustomerRetention(
    startDate?: string,
    endDate?: string,
    filters?: SalesFilters
  ): Observable<any[]> {
    const params = this.buildParams(startDate, endDate, filters);

    return this.http.get<any[]>(`${this.apiUrl}/customer-retention`, { params });
  }

  getHighValueDeals(
    startDate?: string,
    endDate?: string,
    filters?: SalesFilters
  ): Observable<any[]> {
    const params = this.buildParams(startDate, endDate, filters);

    return this.http.get<any[]>(`${this.apiUrl}/high-value-deals`, { params });
  }

  getCustomerOptions(): Observable<SalesFilterOption[]> {
    return this.http.get<SalesFilterOption[]>(`${this.apiUrl}/filter-options/customers`);
  }

  getProductOptions(): Observable<SalesFilterOption[]> {
    return this.http.get<SalesFilterOption[]>(`${this.apiUrl}/filter-options/products`);
  }

  getSalespersonOptions(): Observable<SalesFilterOption[]> {
    return this.http.get<SalesFilterOption[]>(`${this.apiUrl}/filter-options/salespersons`);
  }

  getWorkstatusOptions(): Observable<SalesFilterOption[]> {
    return this.http.get<SalesFilterOption[]>(`${this.apiUrl}/filter-options/workstatus`);
  }

  getCustomerCategoryOptions(): Observable<SalesFilterOption[]> {
    return this.http.get<SalesFilterOption[]>(`${this.apiUrl}/filter-options/customer-categories`);
  }

  getProductCategoryOptions(): Observable<SalesFilterOption[]> {
    return this.http.get<SalesFilterOption[]>(`${this.apiUrl}/filter-options/product-categories`);
  }
}