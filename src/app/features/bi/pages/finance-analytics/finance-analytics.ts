import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Chart, registerables, ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { SectionTitleComponent } from '../../components/section-title/section-title';
import { FinanceKpiService } from '../../services/finance-kpi.service';
import {
  FinanceKpiResponse,
  FinanceRevenueProfitTrendItem,
  FinanceCashFlowTrendItem,
  FinanceOutstandingInvoiceItem,
  FinanceLiabilityAssetItem,
  FinanceAssetDistributionItem,
  FinanceComplianceSummaryResponse,
} from '../../models/finance-kpi-response';
import { FinanceFilterOptionsResponse, FinanceFilters } from '../../services/finance-kpi.service';
import { KpiCardComponent } from '../../components/kpi-card/kpi-card';
import { BiFormatService } from '../../services/bi-format.service';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../../auth/services/auth.service';
Chart.register(...registerables);

type TrendType = 'positive' | 'negative' | 'neutral';

interface FinanceKpiCard {
  title: string;
  value: string;
  trend: string;
  icon: string;
  trendType: TrendType;
  highlight?: boolean;
  warning?: boolean;
  description?: string;
}

@Component({
  selector: 'app-finance-analytics',
  standalone: true,
  imports: [SectionTitleComponent, BaseChartDirective, KpiCardComponent, FormsModule],
  templateUrl: './finance-analytics.html',
  styleUrl: './finance-analytics.css',
})
export class FinanceAnalyticsComponent implements OnInit, OnDestroy {
  @ViewChild('dashboardContent', { static: false }) dashboardContent!: ElementRef;
  private readonly exportFileBaseName = 'finance-analytics-dashboard';
  hasRevenueProfitTrendData = false;
  hasCashFlowData = false;
  hasOutstandingInvoicesData = false;
  hasLiabilityAssetsData = false;
  hasAssetDistributionData = false;

  isExportMenuOpen = false;
  loadingKpis = false;
  kpiErrorMessage = '';
  //loading
  private readonly cdr = inject(ChangeDetectorRef);
  canDisplayDashboardValue = false;
  isCompanyStateReady = false;
  private dashboardLoadingRequests = 0;
  //fin
  isDashboardLoading = false;

  selectedPeriod: 'last30days' | 'last6months' | 'yearToDate' = 'last6months';

  startDate = '';
  endDate = '';
  private biFormat = inject(BiFormatService);
  private authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroy$ = new Subject<void>();
  currency = '';

  totalLiabilitiesDisplay = '0';
  assetValueDisplay = '0';

  assetDistributionLegend: {
    label: string;
    value: string;
    color: string;
  }[] = [];

  nextFilingDates: any[] = [];
  taxPayments: any[] = [];

  depreciationExpenseDisplay = '0';
  complianceStatus = 'Checking Compliance';
  complianceStatusIcon = 'verified_user';

  constructor(private financeKpiService: FinanceKpiService) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.authService.refreshCurrentUser();
    this.authService.syncSelectedCompanyKeyFromStorage();

    setTimeout(() => {
      this.refreshDashboardAccessState();
    });

    this.authService.selectedCompanyKey$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      setTimeout(() => {
        this.refreshDashboardAccessState();
      });
    });
  }
  private refreshDashboardAccessState(): void {
    this.canDisplayDashboardValue = this.authService.canLoadCompanyDashboard();
    this.isCompanyStateReady = true;

    if (this.canDisplayDashboardValue) {
      this.loadFinanceFilterOptions();
      this.setPeriod(this.selectedPeriod);
    } else {
      this.clearFinanceData();
    }

    this.cdr.detectChanges();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  // ── Finance filters ─────────────────────────────────────────────────────────
  isFinanceFilterOpen = false;

  appliedFinanceFilters: FinanceFilters = this.createEmptyFinanceFilters();
  financeFilterOptions: FinanceFilterOptionsResponse = {
    customerNames: [],
    customerCategories: [],
    vendorNames: [],
    vendorIndustries: [],
    accountNames: [],

    invoiceStatuses: [],
    statusGroups: [],
    accountTypes: [],
    transactionTypes: [],
    assetTypes: [],
  };

  draftFinanceFilters = { ...this.appliedFinanceFilters };


  private toLabelArray(options: any[] | undefined | null): string[] {
    return (options ?? [])
      .map((option) => {
        if (typeof option === 'string') {
          return option;
        }

        return option.label ?? option.value ?? '';
      })
      .filter((value) => value !== null && value !== undefined && value.toString().trim() !== '')
      .map((value) => value.toString());
  }

  private loadFinanceFilterOptions(): void {
    if (!this.canDisplayDashboardValue) {
      return;
    }

    this.financeKpiService.getFinanceFilterOptions().subscribe({
      next: (data: any) => {
        console.log('Finance filters raw API response:', data);

        this.financeFilterOptions = {
          customerNames: this.toLabelArray(data.customerNames ?? data.customers),
          customerCategories: this.toLabelArray(data.customerCategories),
          vendorNames: this.toLabelArray(data.vendorNames ?? data.vendors),
          vendorIndustries: this.toLabelArray(data.vendorIndustries),
          accountNames: this.toLabelArray(data.accountNames ?? data.accounts),

          invoiceStatuses: this.toLabelArray(data.invoiceStatuses),
          statusGroups: this.toLabelArray(data.statusGroups),
          accountTypes: this.toLabelArray(data.accountTypes),
          transactionTypes: this.toLabelArray(data.transactionTypes),
          assetTypes: this.toLabelArray(data.assetTypes),
        };

        console.log('Finance filters mapped:', this.financeFilterOptions);
      },
      error: (error) => {
        console.error('Erreur chargement options filtres finance:', error);
      },
    });
  }


  private createEmptyFinanceFilters(): FinanceFilters {
    return {
      customerName: null,
      customerCategory: null,
      vendorName: null,
      vendorIndustry: null,
      invoiceStatus: null,
      statusGroup: null,
      accountName: null,
      accountType: null,
      transactionType: null,
      assetType: null,
      minAmount: null,
      maxAmount: null,
    };
  }
  toggleFinanceFilters(): void {
    this.isFinanceFilterOpen = !this.isFinanceFilterOpen;
    this.draftFinanceFilters = { ...this.appliedFinanceFilters };
  }

  applyFinanceFilters(): void {
    this.appliedFinanceFilters = this.cleanFinanceFilters(this.draftFinanceFilters);
    this.isFinanceFilterOpen = false;

    this.reloadAll();
  }

  resetFinanceFilters(): void {
    this.draftFinanceFilters = this.createEmptyFinanceFilters();

    this.appliedFinanceFilters = { ...this.draftFinanceFilters };
    this.isFinanceFilterOpen = false;

    this.reloadAll();
  }
  private reloadAll(): void {
    if (!this.canDisplayDashboardValue) {
      this.clearFinanceData();
      return;
    }

    this.loadFinanceKpis();
    this.loadRevenueProfitTrend();
    this.loadCashFlowTrend();
    this.loadTopOutstandingInvoices();
    this.loadLiabilityVsAssets();
    this.loadAssetDistribution();
    this.loadComplianceDetails();
  }

  private cleanFinanceFilters(
    filters: FinanceFilters,
  ): FinanceFilters {
    return {
      customerName: filters.customerName?.trim() || null,
      customerCategory: filters.customerCategory?.trim() || null,

      vendorName: filters.vendorName?.trim() || null,
      vendorIndustry: filters.vendorIndustry?.trim() || null,

      invoiceStatus: filters.invoiceStatus?.trim() || null,
      statusGroup: filters.statusGroup?.trim() || null,

      accountName: filters.accountName?.trim() || null,
      accountType: filters.accountType?.trim() || null,
      transactionType: filters.transactionType?.trim() || null,

      assetType: filters.assetType?.trim() || null,

      minAmount:
        filters.minAmount !== null && filters.minAmount !== undefined
          ? Number(filters.minAmount)
          : null,

      maxAmount:
        filters.maxAmount !== null && filters.maxAmount !== undefined
          ? Number(filters.maxAmount)
          : null,
    };
  }

  get hasActiveFinanceFilters(): boolean {
    return Object.values(this.appliedFinanceFilters).some(
      (value) => value !== null && value !== '',
    );
  }
  //end filter
  overviewKpis: FinanceKpiCard[] = [];
  cashKpis: FinanceKpiCard[] = [];
  receivableKpis: FinanceKpiCard[] = [];
  taxKpis: FinanceKpiCard[] = [];

  outstandingInvoices: {
    client: string;
    reference: string;
    amount: string;
    dueDate: string;
    status: string;
  }[] = [];

  // ── Chart options ──────────────────────────────────────────────────────────

  commonLineOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true },
    },
  };

  commonBarOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true },
    },
  };

  // ── Chart data ─────────────────────────────────────────────────────────────

  revenueTrendChartType: 'line' = 'line';
  revenueTrendChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Revenue',
        tension: 0.35,
        fill: true,
        borderColor: '#5b61f6',
        backgroundColor: 'rgba(91, 97, 246, 0.15)',
      },
      {
        data: [],
        label: 'Profit',
        tension: 0.35,
        fill: false,
        borderColor: '#7c8cff',
        borderDash: [5, 5],
      },
    ],
  };

  cashFlowChartType: 'bar' = 'bar';
  cashFlowChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Inflow', backgroundColor: '#5b61f6' },
      { data: [], label: 'Outflow', backgroundColor: '#c9c5f7' },
    ],
  };

  liabilityAssetsChartType: 'bar' = 'bar';
  liabilityAssetsChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Total Asset Value', backgroundColor: '#f6b04f' },
      { data: [], label: 'Total Liabilities', backgroundColor: '#f3c98c' },
    ],
  };

  assetDistributionChartType: 'doughnut' = 'doughnut';
  assetDistributionChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#111827', '#cdd5df', '#5b61f6', '#f6b04f', '#c9c5f7', '#94a3b8'],
        borderWidth: 0,
      },
    ],
  };

  // ── Status helper (called from template) ──────────────────────────────────

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'status-paid';
      case 'overdue':
        return 'status-overdue';
      case 'pending':
        return 'status-pending';
      case 'unpaid':
        return 'status-unpaid';
      case 'partial':
        return 'status-partial';
      default:
        return 'status-neutral';
    }
  }

  // ── Period selection ───────────────────────────────────────────────────────

  setPeriod(period: 'last30days' | 'last6months' | 'yearToDate'): void {
    this.selectedPeriod = period;

    const today = new Date();
    const start = new Date(today);

    if (period === 'last30days') {
      start.setDate(today.getDate() - 30);
    }
    if (period === 'last6months') {
      start.setMonth(today.getMonth() - 6);
    }
    if (period === 'yearToDate') {
      start.setMonth(0);
      start.setDate(1);
    }

    this.startDate = this.formatDate(start);
    this.endDate = this.formatDate(today);

    if (this.canDisplayDashboardValue) {
      this.reloadAll();
    } else {
      this.clearFinanceData();
    }
  }

  // ── Data loading ───────────────────────────────────────────────────────────

  private loadFinanceKpis(): void {
    this.loadingKpis = true;
    this.kpiErrorMessage = '';

    this.trackDashboardLoading(
      this.financeKpiService.getFinanceKpis(
        this.startDate,
        this.endDate,
        this.appliedFinanceFilters,
      ),
    ).subscribe({
      next: (data) => {
        this.currency = data.currency || '';
        this.applyFinanceKpis(data);
        this.loadingKpis = false;
      },
      error: (error) => {
        console.error('Erreur chargement KPIs Finance:', error);
        this.kpiErrorMessage = 'Impossible de charger les KPIs Finance.';
        this.loadingKpis = false;
      },
    });
  }

  private applyFinanceKpis(data: FinanceKpiResponse): void {
    this.overviewKpis = [
      {
        title: 'Total Revenue',
        value: this.formatCurrency(data.totalRevenue),
        trend: '',
        icon: '↗',
        trendType: 'positive',
        highlight: true,
        description: 'Gross income generated before any deductions or expenses.',
      },
      {
        title: 'Net Profit',
        value: this.formatCurrency(data.netProfit),
        trend: '',
        icon: '◔',
        trendType: data.netProfit >= 0 ? 'positive' : 'negative',
        highlight: true,
        description: 'Remaining earnings after all operational costs and taxes.',
      },
      {
        title: 'Total Expenses',
        value: this.formatCurrency(data.totalExpenses),
        trend: '',
        icon: '▣',
        trendType: 'negative',
        description: 'Sum of all operational, administrative, and financial costs.',
      },
      {
        title: 'Gross Margin %',
        value: this.formatPercent(data.grossMarginPercentage),
        trend: '',
        icon: '%',
        trendType: data.grossMarginPercentage >= 0 ? 'positive' : 'negative',
        description: 'Efficiency metric showing profit as a percentage of revenue.',
      },
    ];
    this.cashKpis = [
      {
        title: 'Cash Balance',
        value: this.formatCurrency(data.cashBalance),
        trend: '',
        icon: 'account_balance_wallet',
        trendType: data.cashBalance >= 0 ? 'positive' : 'negative',
        description: 'Available cash amount in the company.',
      },
      {
        title: 'Bank Balance',
        value: this.formatCurrency(data.bankAccountBalance),
        trend: '',
        icon: 'account_balance',
        trendType: 'neutral',
        description: 'Total balance available in bank accounts.',
      },
      {
        title: 'Liquidity Ratio',
        value: this.formatPercent(data.liquidityRatio),
        trend: '',
        icon: 'water_drop',
        trendType: data.liquidityRatio >= 1 ? 'positive' : 'negative',
        description: 'Ability to cover short-term obligations.',
      },
    ];
    this.taxKpis = [
      {
        title: 'VAT Collected',
        value: this.formatCurrency(data.vatCollected),
        trend: '',
        icon: 'percent',
        trendType: 'neutral',
        description: 'VAT collected from customer invoices.',
      },
      {
        title: 'VAT Payable',
        value: this.formatCurrency(data.vatPayable),
        trend: '',
        icon: 'receipt_long',
        trendType: data.vatPayable > 0 ? 'negative' : 'positive',
        description: 'VAT amount that should be paid.',
      },
      {
        title: 'Tax Liability',
        value: this.formatCurrency(data.vatPayable),
        trend: '',
        icon: 'account_balance',
        trendType: data.vatPayable > 0 ? 'negative' : 'positive',
        description: 'Total tax amount due for the selected period.',
      },
    ];
  }
  liabilityAssetsChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => Number(value).toLocaleString('en-US'),
        },
      },
    },
  };
  private loadRevenueProfitTrend(): void {
    this.trackDashboardLoading(
      this.financeKpiService.getRevenueProfitTrend(
        this.startDate,
        this.endDate,
        this.appliedFinanceFilters,
      ),
    ).subscribe({
      next: (data: FinanceRevenueProfitTrendItem[]) => {
        this.hasRevenueProfitTrendData = data.some(
          (item) => Number(item.revenue ?? 0) > 0 || Number(item.profit ?? 0) !== 0,
        );

        this.revenueTrendChartData = {
          labels: data.map((item) => item.period),
          datasets: [
            {
              data: data.map((item) => Number(item.revenue ?? 0)),
              label: 'Revenue',
              tension: 0.35,
              fill: true,
              borderColor: '#5b61f6',
              backgroundColor: 'rgba(91, 97, 246, 0.15)',
            },
            {
              data: data.map((item) => Number(item.profit ?? 0)),
              label: 'Profit',
              tension: 0.35,
              fill: false,
              borderColor: '#7c8cff',
              borderDash: [5, 5],
            },
          ],
        };
      },
      error: (error) => {
        console.error('Erreur chargement Revenue Profit Trend:', error);
        this.hasRevenueProfitTrendData = false;
      },
    });
  }
  private loadCashFlowTrend(): void {
    this.trackDashboardLoading(
      this.financeKpiService.getCashFlowTrend(
        this.startDate,
        this.endDate,
        this.appliedFinanceFilters,
      ),
    ).subscribe({
      next: (data: FinanceCashFlowTrendItem[]) => {
        this.hasCashFlowData = data.some(
          (item) => Number(item.inflow ?? 0) > 0 || Number(item.outflow ?? 0) > 0,
        );

        this.cashFlowChartData = {
          labels: data.map((item) => item.period),
          datasets: [
            {
              data: data.map((item) => Number(item.inflow ?? 0)),
              label: 'Inflow',
              backgroundColor: '#5b61f6',
            },
            {
              data: data.map((item) => Number(item.outflow ?? 0)),
              label: 'Outflow',
              backgroundColor: '#c9c5f7',
            },
          ],
        };
      },
      error: (error) => {
        console.error('Erreur chargement Cash Flow Trend:', error);
        this.hasCashFlowData = false;
      },
    });
  }
  private loadTopOutstandingInvoices(): void {
    this.trackDashboardLoading(
      this.financeKpiService.getTopOutstandingInvoices(
        this.startDate,
        this.endDate,
        this.appliedFinanceFilters,
      ),
    ).subscribe({
      next: (data: FinanceOutstandingInvoiceItem[]) => {
        this.outstandingInvoices = data.map((item) => ({
          client: item.client,
          reference: item.reference,
          amount: this.formatCurrency(item.amount),
          dueDate: item.dueDate,
          status: item.status,
        }));

        this.hasOutstandingInvoicesData = this.outstandingInvoices.length > 0;
        this.updateComplianceStatus();
      },
      error: (error) => {
        console.error('Erreur chargement Outstanding Invoices:', error);
        this.outstandingInvoices = [];
        this.hasOutstandingInvoicesData = false;
      },
    });
  }
  private loadLiabilityVsAssets(): void {
    this.trackDashboardLoading(
      this.financeKpiService.getLiabilityVsAssets(
        this.startDate,
        this.endDate,
        this.appliedFinanceFilters,
      ),
    ).subscribe({
      next: (data: FinanceLiabilityAssetItem) => {
        const totalAssets = Number(data.totalAssets ?? 0);
        const totalLiabilities = Number(data.totalLiabilities ?? 0);

        this.hasLiabilityAssetsData = totalAssets > 0 || totalLiabilities > 0;

        this.totalLiabilitiesDisplay = this.formatCurrency(totalLiabilities);
        this.assetValueDisplay = this.formatCurrency(totalAssets);

        this.liabilityAssetsChartData = {
          labels: ['Assets', 'Liabilities'],
          datasets: [
            {
              data: [Number(data.totalAssets ?? 0), 0],
              label: 'Total Asset Value',
              backgroundColor: '#f59e0b',
              borderRadius: 10,
              borderSkipped: false,
            },
            {
              data: [0, Number(data.totalLiabilities ?? 0)],
              label: 'Total Liabilities',
              backgroundColor: '#f8c978',
              borderRadius: 10,
              borderSkipped: false,
            },
          ],
        };
      },
      error: (error) => {
        console.error('Erreur chargement Liability vs Assets:', error);

        this.hasLiabilityAssetsData = false;
        this.totalLiabilitiesDisplay = this.formatCurrency(0);
        this.assetValueDisplay = this.formatCurrency(0);
      },
    });
  }
  private loadAssetDistribution(): void {
    this.trackDashboardLoading(
      this.financeKpiService.getAssetDistribution(this.endDate, this.appliedFinanceFilters),
    ).subscribe({
      next: (data: FinanceAssetDistributionItem[]) => {
        const colors: string[] = [
          '#F0C097',
          '#7479f8',
          '#C4BFC9',
          '#E0842B',
          '#56c7f5',
          '#f7c66b',
          '#8b8ffb',
        ];

        const values = data.map((item) => Number(item.assetValue ?? 0));

        this.hasAssetDistributionData = values.some((value) => value > 0);

        this.assetDistributionChartData = {
          labels: data.map((item) => item.assetType),
          datasets: [
            {
              data: values,
              backgroundColor: colors,
              borderWidth: 0,
            },
          ],
        };

        this.assetDistributionLegend = data.map((item, index) => ({
          label: item.assetType,
          value: this.formatCurrency(item.assetValue),
          color: colors[index % colors.length],
        }));
      },
      error: (error) => {
        console.error('Erreur chargement Asset Distribution:', error);

        this.hasAssetDistributionData = false;
        this.assetDistributionLegend = [];
      },
    });
  }

  // ── Dashboard loading tracker ──────────────────────────────────────────────

  private trackDashboardLoading<T>(request$: Observable<T>): Observable<T> {
    this.dashboardLoadingRequests++;
    this.isDashboardLoading = true;

    return request$.pipe(
      finalize(() => {
        this.dashboardLoadingRequests = Math.max(0, this.dashboardLoadingRequests - 1);

        if (this.dashboardLoadingRequests === 0) {
          setTimeout(() => {
            this.isDashboardLoading = false;
            this.cdr.detectChanges();
          });
        }
      }),
    );
  }



  private clearFinanceData(): void {
    this.dashboardLoadingRequests = 0;
    this.loadingKpis = false;
    this.isDashboardLoading = false;
    this.kpiErrorMessage = '';
    this.currency = '';
    this.overviewKpis = [];
    this.cashKpis = [];
    this.receivableKpis = [];
    this.taxKpis = [];
    this.outstandingInvoices = [];
    this.taxPayments = [];
    this.assetDistributionLegend = [];
    this.nextFilingDates = [];
    this.totalLiabilitiesDisplay = '0';
    this.assetValueDisplay = '0';
    this.depreciationExpenseDisplay = '0';
    this.complianceStatus = 'Full Compliance';
    this.hasRevenueProfitTrendData = false;
    this.hasCashFlowData = false;
    this.hasOutstandingInvoicesData = false;
    this.hasLiabilityAssetsData = false;
    this.hasAssetDistributionData = false;
    this.revenueTrendChartData = { labels: [], datasets: [] };
    this.cashFlowChartData = { labels: [], datasets: [] };
    this.liabilityAssetsChartData = { labels: [], datasets: [] };
    this.assetDistributionChartData = { labels: [], datasets: [] };
  }

  // ── Export ─────────────────────────────────────────────────────────────────

  toggleExportMenu(): void {
    this.isExportMenuOpen = !this.isExportMenuOpen;
  }

  async exportAsPDF(): Promise<void> {
    const element = this.dashboardContent?.nativeElement;
    if (!element) return;

    this.isExportMenuOpen = false;
    await new Promise((r) => setTimeout(r, 150));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f5f7fb',
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    const imageData = canvas.toDataURL('image/png');

    let remaining = imgH;
    let pos = 0;

    pdf.addImage(imageData, 'PNG', 0, pos, imgW, imgH);
    remaining -= pageH;

    while (remaining > 0) {
      pos = remaining - imgH;
      pdf.addPage();
      pdf.addImage(imageData, 'PNG', 0, pos, imgW, imgH);
      remaining -= pageH;
    }

    pdf.setProperties({ title: this.exportFileBaseName });
    pdf.save(`${this.exportFileBaseName}.pdf`);
  }

  exportAsExcel(): void {
    this.isExportMenuOpen = false;
    this.downloadWorkbook(`${this.exportFileBaseName}-data.xlsx`);
  }

  exportAsCSV(): void {
    this.isExportMenuOpen = false;

    const ws = XLSX.utils.json_to_sheet(this.buildExportRows());
    const csv = XLSX.utils.sheet_to_csv(ws);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `${this.exportFileBaseName}-data.csv`,
    });

    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Excel export: 4 sheets séparés pour une meilleure lisibilité.
   * Sheet 1 → KPIs  |  Sheet 2 → Outstanding Invoices
   * Sheet 3 → Tax Payments  |  Sheet 4 → Asset Distribution
   */
  private downloadWorkbook(filename: string): void {
    const wb = XLSX.utils.book_new();

    // Sheet 1 – KPIs (tous les groupes)
    const allKpis = [
      ...this.overviewKpis.map((k) => ({ Group: 'Overview', Title: k.title, Value: k.value })),
      ...this.cashKpis.map((k) => ({ Group: 'Cash', Title: k.title, Value: k.value })),
      ...this.receivableKpis.map((k) => ({ Group: 'Receivables', Title: k.title, Value: k.value })),
      ...this.taxKpis.map((k) => ({ Group: 'Tax', Title: k.title, Value: k.value })),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allKpis), 'KPIs');

    // Sheet 2 – Outstanding Invoices
    const invoiceRows = this.outstandingInvoices.map((inv) => ({
      Client: inv.client,
      Reference: inv.reference,
      Amount: inv.amount,
      'Due Date': inv.dueDate,
      Status: inv.status,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invoiceRows), 'Outstanding Invoices');

    // Sheet 3 – Tax Payments
    const taxRows = this.taxPayments.map((t) => ({
      Code: t.code,
      Label: t.label,
      Amount: t.amount,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(taxRows), 'Tax Payments');

    // Sheet 4 – Asset Distribution
    const assetRows = this.assetDistributionLegend.map((a) => ({
      Category: a.label,
      Value: a.value,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(assetRows), 'Asset Distribution');

    XLSX.writeFile(wb, filename);
  }

  /**
   * Flat rows used by CSV export (single sheet, section column for context).
   */
  private buildExportRows(): object[] {
    const kpiRows = [
      ...this.overviewKpis,
      ...this.cashKpis,
      ...this.receivableKpis,
      ...this.taxKpis,
    ].map((k) => ({
      Section: 'KPI',
      Title: k.title,
      Value: k.value,
      Trend: k.trend,
    }));

    const invoiceRows = this.outstandingInvoices.map((inv) => ({
      Section: 'Outstanding Invoice',
      Title: inv.client,
      Reference: inv.reference,
      Value: inv.amount,
      DueDate: inv.dueDate,
      Status: inv.status,
    }));

    const taxRows = this.taxPayments.map((t) => ({
      Section: 'Tax Payment',
      Code: t.code,
      Title: t.label,
      Value: t.amount,
    }));

    const assetRows = this.assetDistributionLegend.map((a) => ({
      Section: 'Asset Distribution',
      Title: a.label,
      Value: a.value,
    }));

    return [...kpiRows, ...invoiceRows, ...taxRows, ...assetRows];
  }

  // ── Formatters ─────────────────────────────────────────────────────────────

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatCurrency(value: number | null | undefined): string {
    return this.biFormat.formatCurrency(value, this.currency);
  }

  private formatPercent(value: number | null | undefined): string {
    return `${(value ?? 0).toFixed(1)}%`;
  }
  private loadComplianceSummary(): void {
    this.trackDashboardLoading(
      this.financeKpiService.getComplianceSummary(
        this.startDate,
        this.endDate,
        this.appliedFinanceFilters,
      ),
    ).subscribe({
      next: (data: FinanceComplianceSummaryResponse) => {
        this.complianceStatus = data.complianceStatus;
        this.complianceStatusIcon = data.complianceStatusIcon;

        this.nextFilingDates = data.nextFilingDates.map((item) => ({
          label: item.label,
          date: item.date,
        }));

        this.taxPayments = data.taxPayments.map((item) => ({
          code: item.code,
          label: item.label,
          amount: this.formatCurrency(item.amount),
        }));
      },
      error: (error) => {
        console.error('Erreur chargement Compliance Summary:', error);
      },
    });
  }

  private loadComplianceDetails(): void {
    this.financeKpiService.getNextFilingDates().subscribe({
      next: (data) => {
        this.nextFilingDates = data;
        this.updateComplianceStatus();
      },
      error: (error) => {
        console.error('Erreur filing dates:', error);
        this.updateComplianceStatus();
      },
    });

    this.financeKpiService
      .getRecentTaxPayments(this.startDate, this.endDate, this.appliedFinanceFilters)
      .subscribe({
      next: (data) => {
        this.taxPayments = data.map((item) => ({
          code: item.code,
          label: item.label,
          amount: this.formatCurrency(item.amount),
        }));

        this.updateComplianceStatus();
      },
      error: (error) => {
        console.error('Erreur tax payments:', error);
        this.updateComplianceStatus();
      },
    });
  }
  private updateComplianceStatus(): void {
    const hasOverdueInvoices = this.outstandingInvoices.some(
      (item) => item.status?.toLowerCase() === 'overdue',
    );

    const hasNoTaxPayments = this.taxPayments.length === 0;
    const hasNoFilingDates = this.nextFilingDates.length === 0;

    if (hasOverdueInvoices) {
      this.complianceStatus = 'Attention Required';
      this.complianceStatusIcon = 'warning';
      return;
    }

    if (hasNoTaxPayments || hasNoFilingDates) {
      this.complianceStatus = 'Incomplete Data';
      this.complianceStatusIcon = 'info';
      return;
    }

    this.complianceStatus = 'Full Compliance';
    this.complianceStatusIcon = 'verified_user';
  }
  get overdueInvoicesCount(): number {
    return this.outstandingInvoices.filter((item) => item.status?.toLowerCase() === 'overdue')
      .length;
  }
}
