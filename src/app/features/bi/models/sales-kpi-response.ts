export interface SalesKpiResponse {
  totalRevenue: number;
  numberOfDeals: number;
  winRate: number;
  averageDealValue: number;
  salesOrdersCount: number;
  outstandingReceivables: number;
  pipelineDealsCount: number;
  pipelineValue: number;
  activeCustomers: number;
  inactiveCustomers: number;
  averageCustomerValue: number;
  conversionRate: number;
  currency: string;
}