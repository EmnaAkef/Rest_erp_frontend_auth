export interface FinanceKpiResponse {
  currency: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  grossMarginPercentage: number;

  cashBalance: number;
  bankAccountBalance: number;
  totalLiabilities: number;
  liquidityRatio: number;

  accountsReceivable: number;
  accountsPayable: number;
  numberOfOpenInvoices: number;
  dueInvoices: number;

  assetValue: number;
  depreciationExpense: number;

  vatCollected: number;
  vatPayable: number;
}

export interface FinanceRevenueProfitTrendItem {
  period: string;
  revenue: number;
  profit: number;
}
export interface FinanceCashFlowTrendItem {
  period: string;
  inflow: number;
  outflow: number;
  netCashFlow: number;
}
export interface FinanceOutstandingInvoiceItem {
  client: string;
  reference: string;
  amount: number;
  dueDate: string;
  status: string;
}
export interface FinanceLiabilityAssetItem {
  currentAssets: number;
  fixedAssets: number;
  totalAssets: number;

  currentLiabilities: number;
  longTermLiabilities: number;
  totalLiabilities: number;
}
export interface FinanceAssetDistributionItem {
  assetType: string;
  assetValue: number;
}
export interface FinanceComplianceSummaryResponse {
  complianceStatus: string;
  complianceStatusIcon: string;
  nextFilingDates: FinanceFilingDateItem[];
  taxPayments: FinanceTaxPaymentItem[];
}

export interface FinanceFilingDateItem {
  label: string;
  date: string;
}

export interface FinanceTaxPaymentItem {
  code: string;
  label: string;
  amount: number;
}
