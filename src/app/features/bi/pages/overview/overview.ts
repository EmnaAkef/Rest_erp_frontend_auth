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
  selector: 'app-overview',
  imports: [PageFilters, SectionTitleComponent, KpiCardComponent, BaseChartDirective],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
  standalone: true,
})
export class OverviewComponent {
  @ViewChild('dashboardContent', { static: false }) dashboardContent!: ElementRef;

  isExportMenuOpen = false;

  topKpis = [
    {
      title: 'Total Employees',
      value: '897',
      trend: '+12',
      icon: '👥',
      trendType: 'positive' as const,
    },
    {
      title: 'Presence Rate',
      value: '94.2%',
      trend: '+0.5%',
      icon: '🟢',
      trendType: 'positive' as const,
    },
    {
      title: 'Total Revenue',
      value: '$4.28M',
      trend: '+18.4%',
      icon: '💲',
      trendType: 'positive' as const,
    },
    {
      title: 'Net Profit',
      value: '$1.12M',
      trend: '+22.1%',
      icon: '🧾',
      trendType: 'positive' as const,
    },
    {
      title: 'Win Rate',
      value: '68%',
      trend: '+4.4%',
      icon: '🪙',
      trendType: 'positive' as const,
    },
    {
      title: 'Pipeline Value',
      value: '$12.4M',
      trend: '+44%',
      icon: '🏢',
      trendType: 'positive' as const,
    },
  ];

  topSalesPerformers = [
    { name: 'Sarah Connor', amount: '$450k', trend: '+12%' },
    { name: 'Alex Rivera', amount: '$380k', trend: '+8%' },
    { name: 'Jordan Belfort', amount: '$310k', trend: '+5%' },
    { name: 'Mia Wallace', amount: '$240k', trend: '-2%' },
  ];

  departmentDistribution = [
    { name: 'Sales & Marketing', value: 240 },
    { name: 'Research & Dev', value: 180 },
    { name: 'Operations', value: 320 },
    { name: 'Customer Support', value: 120 },
    { name: 'HR & Admin', value: 37 },
  ];

  customerRevenue = [
    { name: 'Enterprise', value: 92 },
    { name: 'Mid-Market', value: 64 },
    { name: 'SME', value: 38 },
    { name: 'Startup', value: 20 },
  ];

  alertCards = [
    {
      category: 'Finance',
      status: 'Critical',
      title: 'Overdue Invoices',
      value: '$42,400',
      color: 'red',
    },
    {
      category: 'HR',
      status: 'Warning',
      title: 'Unscheduled Late',
      value: '12.4% Avg',
      color: 'orange',
    },
    {
      category: 'Sales',
      status: 'Warning',
      title: 'Lead Drop-off Rate',
      value: '+5.2% Weekly',
      color: 'orange',
    },
    {
      category: 'Finance',
      status: 'Normal',
      title: 'Operational Burn',
      value: '$18k / Daily',
      color: 'green',
    },
  ];

  executiveLedger = [
    {
      period: 'Q2 2024',
      revenue: '$1.08M',
      expenses: '$1.16M',
      profit: '$720K',
      deals: 84,
      pipeline: '$2.37M',
      employees: 897,
      presence: '94.2%',
      customers: 1240,
    },
    {
      period: 'Q1 2024',
      revenue: '$1.45M',
      expenses: '$0.97M',
      profit: '$480K',
      deals: 77,
      pipeline: '$1.92M',
      employees: 882,
      presence: '92.6%',
      customers: 1180,
    },
    {
      period: 'Q4 2023',
      revenue: '$1.72M',
      expenses: '$1.08M',
      profit: '$640K',
      deals: 78,
      pipeline: '$2.15M',
      employees: 875,
      presence: '93.6%',
      customers: 1150,
    },
    {
      period: 'Q3 2023',
      revenue: '$1.38M',
      expenses: '$0.92M',
      profit: '$460K',
      deals: 65,
      pipeline: '$1.84M',
      employees: 860,
      presence: '91.2%',
      customers: 1090,
    },
    {
      period: 'Q2 2023',
      revenue: '$1.22M',
      expenses: '$0.85M',
      profit: '$370K',
      deals: 58,
      pipeline: '$1.62M',
      employees: 845,
      presence: '90.5%',
      customers: 1020,
    },
  ];

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
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [450, 520, 480, 610, 590, 690],
        label: 'Revenue',
        backgroundColor: '#7c83ff',
      },
      {
        data: [150, 190, 180, 230, 225, 270],
        label: 'Expenses',
        backgroundColor: '#d9dcf2',
      },
    ],
  };

  financialLineType: 'line' = 'line';
  financialLineData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [320, 340, 315, 385, 370, 410],
        label: 'Net Profit',
        tension: 0.35,
        fill: false,
        borderColor: '#4f46e5',
      },
    ],
  };

  pipelineFunnelType: 'bar' = 'bar';
  pipelineFunnelData: ChartData<'bar'> = {
    labels: ['Prospects', 'Qualified', 'Proposal', 'Negotiation', 'Closed'],
    datasets: [
      {
        data: [96, 68, 49, 37, 25],
        label: 'Deals',
        backgroundColor: '#f59e0b',
      },
    ],
  };

  dealStatusType: 'doughnut' = 'doughnut';
  dealStatusData: ChartData<'doughnut'> = {
    labels: ['Won', 'Progress', 'Lost'],
    datasets: [
      {
        data: [45, 40, 15],
        backgroundColor: ['#f59e0b', '#f7c98f', '#f3e1c6'],
        borderWidth: 0,
      },
    ],
  };

  attendanceTrendType: 'line' = 'line';
  attendanceTrendData: ChartData<'line'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        data: [74, 82, 76, 95, 91, 104],
        label: 'Attendance',
        tension: 0.4,
        fill: false,
        borderColor: '#4f46e5',
      },
    ],
  };

  attendanceTrendMiniData: ChartData<'line'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        data: [28, 34, 31, 39, 37, 44],
        label: 'Check-ins',
        tension: 0.4,
        fill: false,
        borderColor: '#b4b1ff',
      },
    ],
  };

  retentionType: 'doughnut' = 'doughnut';
  retentionData: ChartData<'doughnut'> = {
    labels: ['Retention', 'Gap'],
    datasets: [
      {
        data: [92, 8],
        backgroundColor: ['#e58e2b', '#f8e0c3'],
        hoverBackgroundColor: ['#e58e2b', '#f8e0c3'],
        borderWidth: 0,
      },
    ],
  };

  customerRevenueType: 'bar' = 'bar';
  customerRevenueData: ChartData<'bar'> = {
    labels: this.customerRevenue.map((item) => item.name),
    datasets: [
      {
        data: this.customerRevenue.map((item) => item.value),
        label: 'Revenue',
        backgroundColor: '#f59e0b',
      },
    ],
  };

  cashBalanceBars = [
    { label: 'Inflow (30d)', value: '+$240,500', width: 78, color: 'green' },
    { label: 'Outflow (30d)', value: '-$112,200', width: 46, color: 'red' },
  ];

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
        trend: item.trend,
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
    const max = 320;
    return `${(value / max) * 100}%`;
  }
}
