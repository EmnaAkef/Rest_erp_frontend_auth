import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Chart, registerables, ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { ChartOptions } from 'chart.js';
import { PageFilters } from '../../../../layout/page-filters/page-filters';
import { SectionTitleComponent } from '../../components/section-title/section-title';
import { KpiCardComponent } from '../../components/kpi-card/kpi-card';
import { OverviewKpiService } from '../../services/overview-kpi.service';
import {
  OverviewKpiResponse,
  OverviewFinancialTrendItem,
  OverviewCashSummaryItem,
  OverviewPipelineFunnelItem,
  OverviewDealStatusItem,
  OverviewTopSalespersonItem,
  OverviewAttendanceTrendItem,
  OverviewDepartmentDistributionItem,
  OverviewCustomerRetentionItem,
  OverviewTopCustomerItem,
  OverviewOperationalAlertItem,
  OverviewExecutiveLedgerItem,
} from '../../models/overview-kpi-response';
import { RouterLink } from '@angular/router';

import { Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../../auth/services/auth.service';


Chart.register(...registerables);
type TrendType = 'positive' | 'negative' | 'neutral';

interface OverviewKpiCard {
  title: string;
  value: string;
  trend: string;
  icon: string;
  trendType: TrendType;
}

@Component({
  selector: 'app-overview',
  imports: [SectionTitleComponent, KpiCardComponent, BaseChartDirective, RouterLink],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
  standalone: true,
})
export class OverviewComponent implements OnInit, OnDestroy {
  @ViewChild('dashboardContent', { static: false }) dashboardContent!: ElementRef;
  companyCurrency = 'USD';
  isExportMenuOpen = false;
  loadingKpis = false;
  kpiErrorMessage = '';

  isDashboardLoading = false;
  private dashboardLoadingRequests = 0;
  private companyChangeSubscription?: Subscription;

  selectedPeriod: 'last30days' | 'last6months' | 'yearToDate' = 'last6months';

  startDate = '';
  endDate = '';

  netCashFlowDisplay = '0';
  netCashFlowValue = 0;

  cashBalanceDisplay = '';
  avgMonthlyNetProfitDisplay = '';
  onTimeRateDisplay = '0%';
  lateCheckinsDisplay = '0';
  retentionRateDisplay = '0%';


  cashBalanceBars = [
    { label: 'Inflow', value: '$0', width: 0, color: 'green' },
    { label: 'Outflow', value: '$0', width: 0, color: 'red' },
  ];
  dealStatusLegend: {
    label: string;
    percentage: string;
  }[] = [];

  retentionNote = 'Customer retention based on active customers.';
  constructor(
    private overviewKpiService: OverviewKpiService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.refreshCurrentUser();
    this.authService.syncSelectedCompanyKeyFromStorage();

    this.updatePeriodDates('last6months');

    this.companyChangeSubscription = this.authService.selectedCompanyKey$.subscribe(() => {
      if (this.authService.canLoadCompanyDashboard()) {
        this.loadAllOverviewData();
      } else {
        this.clearOverviewData();
      }
    });
  }

  ngOnDestroy(): void {
    this.companyChangeSubscription?.unsubscribe();
  }

  topKpis: OverviewKpiCard[] = [];

  topSalesPerformers: {
    name: string;
    amount: string;
    dealsCount: number;
  }[] = [];

  departmentDistribution: {
    name: string;
    value: number;
  }[] = [];
  customerRevenue = [
    { name: 'Enterprise', value: 92 },
    { name: 'Mid-Market', value: 64 },
    { name: 'SME', value: 38 },
    { name: 'Startup', value: 20 },
  ];

  alertCards: {
    category: string;
    status: string;
    title: string;
    value: string;
    color: string;
  }[] = [];

  executiveLedger: {
    period: string;
    revenue: string;
    expenses: string;
    profit: string;
    deals: number;
    pipeline: string;
    employees: string;
    presence: string;
    customers: string;
  }[] = [];
  pipelineFunnelOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };
  commonLineOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };
  netProfitTrendOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 10,
        cornerRadius: 10,
        callbacks: {
          label: (context) => {
            const value = Number(context.parsed.y ?? 0);
            return `Net Profit: ${value.toLocaleString('en-US')}M ${this.companyCurrency}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#7b8494',
          font: {
            size: 11,
          },
          maxRotation: 35,
          minRotation: 25,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.18)',
        },
        ticks: {
          color: '#7b8494',
          font: {
            size: 11,
          },
          callback: (value) => `${Number(value).toLocaleString('en-US')}M`,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
      },
    },
  };
  minimalLineOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  financialChartType: 'bar' = 'bar';
  financialChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Revenue',
        backgroundColor: '#7c83ff',
      },
      {
        data: [],
        label: 'Expenses',
        backgroundColor: '#d9dcf2',
      },
    ],
  };

  financialLineType: 'line' = 'line';
  financialLineData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Net Profit',
        tension: 0.35,
        fill: false,
        borderColor: '#4f46e5',
      },
    ],
  };

  pipelineFunnelType: 'bar' = 'bar';
  pipelineFunnelData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Pipeline Value',
        backgroundColor: '#f59e0b',
      },
    ],
  };

  dealStatusType: 'doughnut' = 'doughnut';
  dealStatusData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#f59e0b', '#f7c98f', '#f3e1c6'],
        borderWidth: 0,
      },
    ],
  };

  attendanceTrendType: 'line' = 'line';
  attendanceTrendData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Presence Rate',
        tension: 0.4,
        fill: false,
        borderColor: '#4f46e5',
      },
    ],
  };

  attendanceTrendMiniData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Late Check-ins',
        tension: 0.4,
        fill: false,
        borderColor: '#b4b1ff',
      },
    ],
  };

  retentionType: 'doughnut' = 'doughnut';
  retentionData: ChartData<'doughnut'> = {
    labels: ['Retention', 'Inactive'],
    datasets: [
      {
        data: [0, 100],
        backgroundColor: ['#e58e2b', '#f8e0c3'],
        hoverBackgroundColor: ['#e58e2b', '#f8e0c3'],
        borderWidth: 0,
      },
    ],
  };

  customerRevenueType: 'bar' = 'bar';
  customerRevenueData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Revenue',
        backgroundColor: '#f59e0b',
      },
    ],
  };
  customerRevenueOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (context) => {
            const value = Number(context.parsed.y ?? 0);
            return `Revenue: ${value.toLocaleString('en-US')}M`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 12,
            weight: 500,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.18)',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 12,
          },
          callback: (value) => `${Number(value).toLocaleString('en-US')}M`,
        },
      },
    },
  };
  private loadFinancialTrend(): void {
    this.trackDashboardLoading(
      this.overviewKpiService.getFinancialTrend(this.startDate, this.endDate),
    ).subscribe({
      next: (data) => {
        this.applyFinancialTrend(data);
      },
      error: (error) => {
        console.error('Erreur chargement Financial Trend:', error);
      },
    });
  }

  private applyFinancialTrend(data: OverviewFinancialTrendItem[]): void {
    this.financialChartData = {
      labels: data.map((item) => item.period),
      datasets: [
        {
          data: data.map((item) => this.toMillions(item.revenue)),
          label: 'Revenue',
          backgroundColor: '#7c83ff',
        },
        {
          data: data.map((item) => this.toMillions(item.expenses)),
          label: 'Expenses',
          backgroundColor: '#d9dcf2',
        },
      ],
    };

    this.financialLineData = {
      labels: data.map((item) => item.period),
      datasets: [
        {
          data: data.map((item) => this.toMillions(item.netProfit)),
          label: 'Net Profit',
          tension: 0.4,
          fill: true,
          borderColor: '#5b61f6',
          backgroundColor: 'rgba(91, 97, 246, 0.14)',
          pointBackgroundColor: '#5b61f6',
          pointBorderColor: '#ffffff',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };

    const totalNetProfit = data.reduce((sum, item) => sum + (item.netProfit ?? 0), 0);

    const avgMonthlyNetProfit = data.length > 0 ? totalNetProfit / data.length : 0;

    this.avgMonthlyNetProfitDisplay = this.formatCompactCurrency(avgMonthlyNetProfit);
  }

  private toMillions(value: number | null | undefined): number {
    return Number(((value ?? 0) / 1_000_000).toFixed(2));
  }
  private loadCashSummary(): void {
    this.trackDashboardLoading(
      this.overviewKpiService.getCashSummary(this.startDate, this.endDate),
    ).subscribe({
      next: (data) => {
        this.applyCashSummary(data);
      },
      error: (error) => {
        console.error('Erreur chargement Cash Summary:', error);
      },
    });
  }

  private applyCashSummary(data: OverviewCashSummaryItem): void {
    const cashBalance = Number(data.cashBalance ?? 0);
    const inflow = Number(data.inflow ?? 0);
    const outflow = Math.abs(Number(data.outflow ?? 0));
    const netCashFlow = inflow - outflow;

    this.cashBalanceDisplay = this.formatCompactCurrency(cashBalance);

    this.netCashFlowValue = netCashFlow;
    this.netCashFlowDisplay =
      netCashFlow >= 0
        ? `+${this.formatCompactCurrency(netCashFlow)}`
        : `-${this.formatCompactCurrency(Math.abs(netCashFlow))}`;

    const maxValue = Math.max(inflow, outflow, 1);

    this.cashBalanceBars = [
      {
        label: 'Inflow',
        value: `+${this.formatCompactCurrency(inflow)}`,
        width: Math.round((inflow / maxValue) * 100),
        color: 'green',
      },
      {
        label: 'Outflow',
        value: `-${this.formatCompactCurrency(outflow)}`,
        width: Math.round((outflow / maxValue) * 100),
        color: 'red',
      },
    ];
  }
  private loadSalesPipelineFunnel(): void {
    this.trackDashboardLoading(
      this.overviewKpiService.getSalesPipelineFunnel(this.startDate, this.endDate),
    ).subscribe({
      next: (data) => {
        this.applySalesPipelineFunnel(data);
      },
      error: (error) => {
        console.error('Erreur chargement Sales Pipeline Funnel:', error);
      },
    });
  }
  private applySalesPipelineFunnel(data: OverviewPipelineFunnelItem[]): void {
    const sortedData = [...data].sort(
      (a, b) => Number(b.dealCount ?? 0) - Number(a.dealCount ?? 0),
    );

    this.pipelineFunnelData = {
      labels: sortedData.map((item) => item.stage),
      datasets: [
        {
          data: sortedData.map((item) => Number(item.dealCount ?? 0)),
          label: 'Pipeline Deals',
          backgroundColor: '#f59e0b',
          borderRadius: 4,
          barThickness: 28,
        },
      ],
    };
  }
  private loadAttendanceTrend(): void {
    this.trackDashboardLoading(
      this.overviewKpiService.getAttendanceTrend(this.startDate, this.endDate),
    ).subscribe({
      next: (data) => {
        this.applyAttendanceTrend(data);
      },
      error: (error) => {
        console.error('Erreur chargement Attendance Trend:', error);
      },
    });
  }
  attendanceTrendOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = Number(context.parsed.y ?? 0);

            if (label.includes('Presence') || label.includes('On-Time')) {
              return `${label}: ${value.toFixed(2)}%`;
            }

            return `${label}: ${value.toLocaleString('en-US')}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#7b8494',
          font: {
            size: 11,
          },
        },
      },
      y: {
        type: 'linear',
        position: 'left',
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(148, 163, 184, 0.18)',
        },
        ticks: {
          color: '#7b8494',
          font: {
            size: 11,
          },
          callback: (value) => `${value}%`,
        },
      },
      y1: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#7b8494',
          font: {
            size: 11,
          },
          callback: (value) => Number(value).toLocaleString('en-US'),
        },
      },
    },
    elements: {
      line: {
        tension: 0.42,
        borderWidth: 3,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
      },
    },
  };
  private applyAttendanceTrend(data: OverviewAttendanceTrendItem[]): void {
    this.attendanceTrendData = {
      labels: data.map((item) => item.period),
      datasets: [
        {
          data: data.map((item) => Number(item.onTimeRate ?? item.presenceRate ?? 0)),
          label: 'On-Time Rate',
          tension: 0.42,
          fill: true,
          borderColor: '#5b61f6',
          backgroundColor: 'rgba(91, 97, 246, 0.12)',
          pointBackgroundColor: '#5b61f6',
          pointBorderColor: '#ffffff',
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y',
        },
        {
          data: data.map((item) => Number(item.lateCheckins ?? 0)),
          label: 'Late Check-ins',
          tension: 0.42,
          fill: false,
          borderColor: '#f59e0b',
          backgroundColor: '#f59e0b',
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#ffffff',
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y1',
        },
      ],
    };

    this.attendanceTrendMiniData = {
      labels: data.map((item) => item.period),
      datasets: [
        {
          data: data.map((item) => Number(item.lateCheckins ?? 0)),
          label: 'Late Check-ins',
          tension: 0.42,
          fill: false,
          borderColor: '#a7a5ff',
          backgroundColor: '#a7a5ff',
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };

    const latest = data.length > 0 ? data[data.length - 1] : null;

    this.onTimeRateDisplay = latest
      ? this.formatPercent(latest.onTimeRate ?? latest.presenceRate)
      : '0%';

    this.lateCheckinsDisplay = latest ? this.formatNumber(latest.lateCheckins) : '0';
  }

  private loadDepartmentDistribution(): void {
    this.trackDashboardLoading(this.overviewKpiService.getDepartmentDistribution()).subscribe({
      next: (data) => {
        this.applyDepartmentDistribution(data);
      },
      error: (error) => {
        console.error('Erreur chargement Department Distribution:', error);
      },
    });
  }

  private applyDepartmentDistribution(data: OverviewDepartmentDistributionItem[]): void {
    this.departmentDistribution = data.map((item) => ({
      name: item.departmentName,
      value: item.employeeCount,
    }));
  }

  private loadCustomerRetention(): void {
    this.trackDashboardLoading(this.overviewKpiService.getCustomerRetention()).subscribe({
      next: (data) => {
        this.applyCustomerRetention(data);
      },
      error: (error) => {
        console.error('Erreur chargement Customer Retention:', error);
      },
    });
  }

  private applyCustomerRetention(data: OverviewCustomerRetentionItem): void {
    const retentionRate = data.retentionRate ?? 0;
    const inactiveRate = Math.max(0, 100 - retentionRate);

    this.retentionData = {
      labels: ['Retention', 'Inactive'],
      datasets: [
        {
          data: [retentionRate, inactiveRate],
          backgroundColor: ['#e58e2b', '#f8e0c3'],
          hoverBackgroundColor: ['#e58e2b', '#f8e0c3'],
          borderWidth: 0,
        },
      ],
    };

    this.retentionRateDisplay = `${retentionRate.toFixed(2)}%`;

    this.retentionNote = `${this.formatNumber(data.activeCustomers)} active customers out of ${this.formatNumber(data.totalCustomers)} total customers.`;
  }

  private loadTopCustomersByRevenue(): void {
    this.trackDashboardLoading(
      this.overviewKpiService.getTopCustomersByRevenue(this.startDate, this.endDate),
    ).subscribe({
      next: (data) => {
        this.applyTopCustomersByRevenue(data);
      },
      error: (error) => {
        console.error('Erreur chargement Top Customers by Revenue:', error);
      },
    });
  }

  private updatePeriodDates(period: 'last30days' | 'last6months' | 'yearToDate'): void {
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
  }

  private loadAllOverviewData(): void {
    if (!this.canDisplayDashboard()) {
      this.clearOverviewData();
      return;
    }

    this.loadOverviewKpis();
    this.loadFinancialTrend();
    this.loadCashSummary();
    this.loadSalesPipelineFunnel();
    this.loadDealStatus();
    this.loadTopSalesPerformers();
    this.loadAttendanceTrend();
    this.loadDepartmentDistribution();
    this.loadCustomerRetention();
    this.loadTopCustomersByRevenue();
    this.loadOperationalAlerts();
    this.loadExecutiveLedger();
  }

  private clearOverviewData(): void {
    this.dashboardLoadingRequests = 0;
    this.isDashboardLoading = false;
    this.loadingKpis = false;

    this.topKpis = [];
    this.topSalesPerformers = [];
    this.departmentDistribution = [];
    this.customerRevenue = [];
    this.alertCards = [];
    this.executiveLedger = [];

    this.financialChartData = { labels: [], datasets: [] };
    this.financialLineData = { labels: [], datasets: [] };
    this.pipelineFunnelData = { labels: [], datasets: [] };
    this.dealStatusData = { labels: [], datasets: [] };
    this.attendanceTrendData = { labels: [], datasets: [] };
    this.attendanceTrendMiniData = { labels: [], datasets: [] };
    this.retentionData = {
      labels: ['Retention', 'Inactive'],
      datasets: [
        {
          data: [0, 100],
          backgroundColor: ['#e58e2b', '#f8e0c3'],
          hoverBackgroundColor: ['#e58e2b', '#f8e0c3'],
          borderWidth: 0,
        },
      ],
    };

    this.kpiErrorMessage = 'Please select a company from the sidebar to view its dashboard.';
  }

  private applyTopCustomersByRevenue(data: OverviewTopCustomerItem[]): void {
    this.customerRevenue = data.map((item) => ({
      name: item.customerName,
      value: this.toMillions(item.revenue),
    }));

    this.customerRevenueData = {
      labels: data.map((item) => item.customerName),
      datasets: [
        {
          data: data.map((item) => this.toMillions(item.revenue)),
          label: 'Revenue',
          backgroundColor: '#f59e0b',
          borderRadius: 12,
          borderSkipped: false,
          barThickness: 48,
          maxBarThickness: 54,
        },
      ],
    };
  }

  private loadOperationalAlerts(): void {
    this.trackDashboardLoading(
      this.overviewKpiService.getOperationalAlerts(this.startDate, this.endDate),
    ).subscribe({
      next: (data) => {
        this.applyOperationalAlerts(data);
      },
      error: (error) => {
        console.error('Erreur chargement Operational Alerts:', error);
      },
    });
  }

  private applyOperationalAlerts(data: OverviewOperationalAlertItem[]): void {
    this.alertCards = data.map((item) => ({
      category: item.category,
      status: item.status,
      title: item.title,
      value: this.formatAlertValue(item),
      color: item.color,
    }));
  }

  private formatAlertValue(item: OverviewOperationalAlertItem): string {
    const suffix = item.valueSuffix ?? '';

    if (item.title === 'Overdue Invoices') {
      return this.formatCompactCurrency(item.value);
    }

    if (item.title === 'Operational Burn') {
      return `${this.formatCompactCurrency(item.value)}${suffix}`;
    }

    if (item.title === 'Unscheduled Late') {
      return `${Number(item.value ?? 0).toFixed(2)}${suffix}`;
    }

    if (item.title === 'Lead Drop-off Rate') {
      return `${Number(item.value ?? 0).toFixed(2)}${suffix}`;
    }

    return `${item.value}${suffix}`;
  }
  private loadExecutiveLedger(): void {
    this.trackDashboardLoading(
      this.overviewKpiService.getExecutiveLedger(this.startDate, this.endDate),
    ).subscribe({
      next: (data) => {
        this.applyExecutiveLedger(data);
      },
      error: (error) => {
        console.error('Erreur chargement Executive Ledger:', error);
      },
    });
  }

  private applyExecutiveLedger(data: OverviewExecutiveLedgerItem[]): void {
    this.executiveLedger = data.map((item) => ({
      period: item.period,
      revenue: this.formatCompactCurrency(item.revenue),
      expenses: this.formatCompactCurrency(item.expenses),
      profit: this.formatSignedCompactCurrency(item.netProfit),
      deals: item.dealsWon,
      pipeline: this.formatCompactCurrency(item.pipeline),
      employees: this.formatNumber(item.employees),
      presence: this.formatPercent(item.presenceRate),
      customers: this.formatNumber(item.customers),
    }));
  }
  toggleExportMenu(): void {
    this.isExportMenuOpen = !this.isExportMenuOpen;
  }

  async exportAsPDF(): Promise<void> {
    const element = this.dashboardContent?.nativeElement;
    if (!element) return;

    this.isExportMenuOpen = false;

    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f5f7fb',
    });

    const imageData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imageData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imageData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('overview-dashboard.pdf');
  }
  exportAsExcel(): void {
    this.isExportMenuOpen = false;

    const rows = this.buildExportRows();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Overview');
    XLSX.writeFile(workbook, 'overview-dashboard-data.xlsx');
  }

  exportAsCSV(): void {
    this.isExportMenuOpen = false;

    const rows = this.buildExportRows();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'overview-dashboard-data.csv');
    link.click();

    URL.revokeObjectURL(url);
  }

  private buildExportRows(): any[] {
    return [
      ...this.topKpis.map((item) => ({
        section: 'Top KPIs',
        title: item.title,
        value: item.value,
        trend: item.trend,
      })),
      ...this.topSalesPerformers.map((item) => ({
        section: 'Top Sales Performers',
        name: item.name,
        amount: item.amount,
        dealsCount: item.dealsCount,
      })),
      ...this.departmentDistribution.map((item) => ({
        section: 'Department Distribution',
        department: item.name,
        employees: item.value,
      })),
      ...this.customerRevenue.map((item) => ({
        section: 'Customer Revenue',
        customer_type: item.name,
        revenue_index: item.value,
      })),
      ...this.alertCards.map((item) => ({
        section: 'Operational Alerts',
        category: item.category,
        status: item.status,
        title: item.title,
        value: item.value,
      })),
      ...this.executiveLedger.map((item) => ({
        section: 'Executive Ledger',
        period: item.period,
        revenue: item.revenue,
        expenses: item.expenses,
        profit: item.profit,
        deals: item.deals,
        pipeline: item.pipeline,
        employees: item.employees,
        presence: item.presence,
        customers: item.customers,
      })),
    ];
  }

  getAlertClass(color: string): string {
    if (color === 'red') return 'alert-red';
    if (color === 'orange') return 'alert-orange';
    if (color === 'green') return 'alert-green';
    return '';
  }

  getDeptWidth(value: number): string {
    const max = Math.max(...this.departmentDistribution.map((item) => item.value), 1);

    return `${Math.round((value / max) * 100)}%`;
  }

  private trackDashboardLoading<T>(request$: Observable<T>): Observable<T> {
    this.dashboardLoadingRequests++;
    this.isDashboardLoading = true;

    return request$.pipe(
      finalize(() => {
        this.dashboardLoadingRequests = Math.max(0, this.dashboardLoadingRequests - 1);

        if (this.dashboardLoadingRequests === 0) {
          this.isDashboardLoading = false;
        }
      }),
    );
  }

  setPeriod(period: 'last30days' | 'last6months' | 'yearToDate'): void {
    this.updatePeriodDates(period);

    if (this.authService.canLoadCompanyDashboard()) {
      this.loadAllOverviewData();
    } else {
      this.clearOverviewData();
    }
  }

  canDisplayDashboard(): boolean {
    return this.authService.canLoadCompanyDashboard();
  }

  private loadOverviewKpis(): void {
    this.loadingKpis = true;
    this.kpiErrorMessage = '';

    this.trackDashboardLoading(
      this.overviewKpiService.getOverviewKpis(this.startDate, this.endDate),
    ).subscribe({
      next: (data) => {
        console.log('Overview KPIs reçus:', data);
        console.log('Période utilisée:', this.startDate, this.endDate);

        this.applyOverviewKpis(data);
        this.loadingKpis = false;
      },
      error: (error) => {
        console.error('Erreur chargement Overview KPIs:', error);
        this.kpiErrorMessage = 'Impossible de charger les KPIs Overview.';
        this.loadingKpis = false;
      },
    });
  }

  private applyOverviewKpis(data: OverviewKpiResponse): void {
    this.companyCurrency = data.currency || 'USD';
    this.topKpis = [
      {
        title: 'Total Employees',
        value: this.formatNumber(data.totalEmployees),
        trend: '',
        icon: 'groups',
        trendType: 'positive',
      },
      {
        title: 'Presence Rate',
        value: this.formatPercent(data.presenceRate),
        trend: '',
        icon: 'check_circle',
        trendType: data.presenceRate >= 80 ? 'positive' : 'negative',
      },
      {
        title: 'Total Revenue',
        value: this.formatCompactCurrency(data.totalRevenue),
        trend: '',
        icon: 'attach_money',
        trendType: 'positive',
      },
      {
        title: 'Net Profit',
        value: this.formatCompactCurrency(data.netProfit),
        trend: '',
        icon: 'receipt_long',
        trendType: data.netProfit >= 0 ? 'positive' : 'negative',
      },
      {
        title: 'Win Rate',
        value: this.formatPercent(data.winRate),
        trend: '',
        icon: 'account_balance',
        trendType: data.winRate >= 50 ? 'positive' : 'negative',
      },
      {
        title: 'Pipeline Value',
        value: this.formatCompactCurrency(data.pipelineValue),
        trend: '',
        icon: 'apartment',
        trendType: 'positive',
      },
    ];
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private formatNumber(value: number | null | undefined): string {
    const safeValue = value ?? 0;
    return new Intl.NumberFormat('en-US').format(safeValue);
  }

  private formatPercent(value: number | null | undefined): string {
    const safeValue = value ?? 0;
    return `${safeValue.toFixed(2)}%`;
  }

  private getCurrencyDisplay(currency: string): string {
    const value = (currency || '').trim().toUpperCase();

    if (value === 'TND' || value === 'DT') {
      return 'DT';
    }

    if (value === 'USD' || value === '$') {
      return '$';
    }

    if (value === 'EUR' || value === '€') {
      return '€';
    }

    if (value === 'SAR') {
      return 'SAR';
    }

    return value || 'USD';
  }

  private formatCompactCurrency(value: number | null | undefined): string {
    const safeValue = value ?? 0;
    const absValue = Math.abs(safeValue);

    let formattedValue: string;

    if (absValue >= 1_000_000_000) {
      formattedValue = `${(absValue / 1_000_000_000).toFixed(2)}B`;
    } else if (absValue >= 1_000_000) {
      formattedValue = `${(absValue / 1_000_000).toFixed(2)}M`;
    } else if (absValue >= 1_000) {
      formattedValue = `${(absValue / 1_000).toFixed(2)}K`;
    } else {
      formattedValue = absValue.toFixed(0);
    }

    const sign = safeValue < 0 ? '-' : '';
    const currencyDisplay = this.getCurrencyDisplay(this.companyCurrency);

    if (currencyDisplay === '$' || currencyDisplay === '€') {
      return `${sign}${currencyDisplay}${formattedValue}`;
    }

    return `${sign}${formattedValue} ${currencyDisplay}`;
  }

  private loadDealStatus(): void {
    this.trackDashboardLoading(
      this.overviewKpiService.getDealStatus(this.startDate, this.endDate),
    ).subscribe({
      next: (data) => {
        this.applyDealStatus(data);
      },
      error: (error) => {
        console.error('Erreur chargement Deal Status:', error);
      },
    });
  }

  private applyDealStatus(data: OverviewDealStatusItem[]): void {
    this.dealStatusData = {
      labels: data.map((item) => item.status),
      datasets: [
        {
          data: data.map((item) => item.percentage),
          backgroundColor: ['#f59e0b', '#f7c98f', '#f3e1c6'],
          borderWidth: 0,
        },
      ],
    };

    this.dealStatusLegend = data.map((item) => ({
      label: item.status,
      percentage: `${item.percentage.toFixed(2)}%`,
    }));
  }
  private loadTopSalesPerformers(): void {
    this.trackDashboardLoading(
      this.overviewKpiService.getTopSalesPerformers(this.startDate, this.endDate),
    ).subscribe({
      next: (data) => {
        this.applyTopSalesPerformers(data);
      },
      error: (error) => {
        console.error('Erreur chargement Top Sales Performers:', error);
      },
    });
  }

  private applyTopSalesPerformers(data: OverviewTopSalespersonItem[]): void {
    this.topSalesPerformers = data.map((item) => ({
      name: item.salespersonName,
      amount: this.formatCompactCurrency(item.totalRevenue),
      dealsCount: item.dealsCount,
    }));
  }

  private formatSignedCompactCurrency(value: number | null | undefined): string {
    const safeValue = value ?? 0;
    const formatted = this.formatCompactCurrency(Math.abs(safeValue));

    if (safeValue > 0) {
      return `+${formatted}`;
    }

    if (safeValue < 0) {
      return `-${formatted}`;
    }

    return '$0';
  }
  exportExecutiveLedgerAsCSV(): void {
    const rows = this.executiveLedger.map((item) => ({
      Period: item.period,
      Revenue: item.revenue,
      Expenses: item.expenses,
      'Net Profit': item.profit,
      'Deals Won': item.deals,
      Pipeline: item.pipeline,
      Employees: item.employees,
      Presence: item.presence,
      Customers: item.customers,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'executive-summary-ledger.csv');
    link.click();

    URL.revokeObjectURL(url);
  }
}
