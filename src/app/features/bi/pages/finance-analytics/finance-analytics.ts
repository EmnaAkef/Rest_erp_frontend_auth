import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables, ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

import { PageFilters } from '../../../../layout/page-filters/page-filters';
import { SectionTitleComponent } from '../../components/section-title/section-title';
import { KpiCardComponent } from '../../components/kpi-card/kpi-card';

Chart.register(...registerables);

@Component({
  selector: 'app-finance-analytics',
  imports: [PageFilters, SectionTitleComponent, KpiCardComponent, BaseChartDirective],
  templateUrl: './finance-analytics.html',
  styleUrl: './finance-analytics.css',
})
export class FinanceAnalyticsComponent {
  @ViewChild('dashboardContent', { static: false }) dashboardContent!: ElementRef;

  isExportMenuOpen = false;

  overviewKpis = [
    {
      title: 'Total Revenue',
      value: '$4,285,100',
      trend: '+12.5%',
      icon: '↗',
      trendType: 'positive' as const,
      highlight: true,
      description: 'Gross income generated before any deductions or expenses.',
    },
    {
      title: 'Net Profit',
      value: '$1,120,450',
      trend: '+8.2%',
      icon: '◔',
      trendType: 'positive' as const,
      highlight: true,
      description: 'Remaining earnings after all operational costs and taxes.',
    },
    {
      title: 'Total Expenses',
      value: '$3,164,650',
      trend: '+4.1%',
      icon: '▣',
      trendType: 'negative' as const,
      highlight: false,
      description: 'Sum of all operational, administrative, and financial costs.',
    },
    {
      title: 'Gross Margin %',
      value: '26.1%',
      trend: '+2.4%',
      icon: '%',
      trendType: 'positive' as const,
      highlight: false,
      description: 'Efficiency metric showing profit as a percentage of revenue.',
    },
  ];

  cashKpis = [
    {
      title: 'Cash Balance',
      value: '$842,000',
      trend: '',
      icon: '▣',
      trendType: 'neutral' as const,
      description: 'Total liquid cash currently held across all internal accounts.',
    },
    {
      title: 'Bank Account Balance',
      value: '$1,250,500',
      trend: '',
      icon: '▥',
      trendType: 'neutral' as const,
      description: 'Consolidated balance from primary and secondary banking partners.',
    },
    {
      title: 'Liquidity Ratio',
      value: '1.85',
      trend: '+0.1',
      icon: '⬡',
      trendType: 'positive' as const,
      description: 'Ability to meet short-term obligations (Current Assets / Liabilities).',
    },
  ];

  receivableKpis = [
    {
      title: 'Total Accounts Receivable',
      value: '$650,400',
      trend: '',
      icon: '↗',
      trendType: 'neutral' as const,
    },
    {
      title: 'Total Accounts Payable',
      value: '$420,100',
      trend: '',
      icon: '↘',
      trendType: 'neutral' as const,
    },
    {
      title: 'Number of Open Invoices',
      value: '142',
      trend: '',
      icon: '▤',
      trendType: 'neutral' as const,
    },
    {
      title: 'Due Invoices (Next 7 Days)',
      value: '28',
      trend: '',
      icon: '◷',
      trendType: 'neutral' as const,
      warning: true,
    },
  ];

  taxKpis = [
    {
      title: 'VAT Collected',
      value: '$185,200',
      trend: '',
      icon: '▣',
      trendType: 'neutral' as const,
    },
    {
      title: 'VAT Payable',
      value: '$64,800',
      trend: '',
      icon: '▣',
      trendType: 'neutral' as const,
    },
    {
      title: 'Estimated Tax',
      value: '$210,000',
      trend: '',
      icon: '◈',
      trendType: 'neutral' as const,
      highlight: true,
    },
  ];

  outstandingInvoices = [
    {
      client: 'Acme Global Tech',
      reference: 'INV-2024-001',
      amount: '$45,200',
      dueDate: 'Oct 24, 2024',
      status: 'Overdue',
    },
    {
      client: 'Starlight Systems',
      reference: 'INV-2024-005',
      amount: '$12,800',
      dueDate: 'Oct 28, 2024',
      status: 'Pending',
    },
    {
      client: 'Nebula Corp',
      reference: 'INV-2024-009',
      amount: '$28,500',
      dueDate: 'Nov 02, 2024',
      status: 'Due Soon',
    },
    {
      client: 'Zenith Services',
      reference: 'INV-2024-012',
      amount: '$9,100',
      dueDate: 'Nov 05, 2024',
      status: 'Paid',
    },
    {
      client: 'Prime Logistics',
      reference: 'INV-2024-015',
      amount: '$5,300',
      dueDate: 'Nov 12, 2024',
      status: 'Pending',
    },
  ];

  taxPayments = [
    {
      code: 'PY',
      label: 'Payroll Tax Q3',
      amount: '$42,500',
    },
    {
      code: 'CP',
      label: 'Corporate Tax Adj.',
      amount: '$18,200',
    },
  ];

  commonLineOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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

  commonBarOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
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

  revenueTrendChartType: 'line' = 'line';
  revenueTrendChartData: ChartData<'line'> = {
    labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [420, 460, 445, 535, 520],
        label: 'Revenue',
        tension: 0.35,
        fill: true,
        borderColor: '#5b61f6',
        backgroundColor: 'rgba(91, 97, 246, 0.15)',
      },
      {
        data: [210, 235, 228, 260, 255],
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
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [11500, 14800, 17800, 13200, 22100, 4600, 3500],
        label: 'Inflow',
        backgroundColor: '#5b61f6',
      },
      {
        data: [7400, 13200, 8200, 10100, 14500, 1800, 900],
        label: 'Outflow',
        backgroundColor: '#c9c5f7',
      },
    ],
  };

  liabilityAssetsChartType: 'bar' = 'bar';
  liabilityAssetsChartData: ChartData<'bar'> = {
    labels: ['Current', 'Fixed', 'Total'],
    datasets: [
      {
        data: [2.1, 4.3, 5.7],
        label: 'Total Asset Value',
        backgroundColor: '#f6b04f',
      },
      {
        data: [1.1, 2.4, 3.2],
        label: 'Total Liabilities',
        backgroundColor: '#f3c98c',
      },
    ],
  };

  assetDistributionChartType: 'doughnut' = 'doughnut';
  assetDistributionChartData: ChartData<'doughnut'> = {
    labels: ['Fixed Assets', 'Current Assets'],
    datasets: [
      {
        data: [4.5, 1.2],
        backgroundColor: ['#111827', '#cdd5df'],
        borderWidth: 0,
      },
    ],
  };

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

    pdf.save('finance-analytics-dashboard.pdf');
  }

  exportAsExcel(): void {
    this.isExportMenuOpen = false;

    const rows = this.buildExportRows();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Finance Analytics');
    XLSX.writeFile(workbook, 'finance-analytics-data.xlsx');
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
    link.setAttribute('download', 'finance-analytics-data.csv');
    link.click();

    URL.revokeObjectURL(url);
  }

  private buildExportRows(): any[] {
    return [
      ...this.overviewKpis.map((item) => ({
        section: 'Financial Overview',
        title: item.title,
        value: item.value,
        trend: item.trend,
        description: item.description,
      })),
      ...this.cashKpis.map((item) => ({
        section: 'Cash and Treasury',
        title: item.title,
        value: item.value,
        trend: item.trend,
        description: item.description,
      })),
      ...this.receivableKpis.map((item) => ({
        section: 'Receivables and Payables',
        title: item.title,
        value: item.value,
        trend: item.trend,
      })),
      ...this.taxKpis.map((item) => ({
        section: 'Taxes and Compliance',
        title: item.title,
        value: item.value,
        trend: item.trend,
      })),
      ...this.outstandingInvoices.map((item) => ({
        section: 'Outstanding Invoices',
        client: item.client,
        reference: item.reference,
        amount: item.amount,
        due_date: item.dueDate,
        status: item.status,
      })),
      ...this.taxPayments.map((item) => ({
        section: 'Recent Tax Payments',
        code: item.code,
        label: item.label,
        amount: item.amount,
      })),
    ];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Overdue':
        return 'status-overdue';
      case 'Pending':
        return 'status-pending';
      case 'Due Soon':
        return 'status-due-soon';
      case 'Paid':
        return 'status-paid';
      default:
        return '';
    }
  }
}
