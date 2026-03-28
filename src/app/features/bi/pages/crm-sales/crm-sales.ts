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
  selector: 'app-crm-sales',
  imports: [PageFilters, SectionTitleComponent, KpiCardComponent, BaseChartDirective],
  templateUrl: './crm-sales.html',
  styleUrl: './crm-sales.css',
})
export class CrmSalesComponent {
  @ViewChild('dashboardContent', { static: false }) dashboardContent!: ElementRef;

  isExportMenuOpen = false;

  kpis = [
    {
      title: 'Total Revenue',
      value: '$4,820,500',
      trend: '+12.5%',
      icon: '💲',
      trendType: 'positive' as const,
    },
    {
      title: 'Number of Deals',
      value: '248',
      trend: '+18%',
      icon: '📦',
      trendType: 'positive' as const,
    },
    {
      title: 'Win Rate',
      value: '64.2%',
      trend: '+4.1%',
      icon: '🎯',
      trendType: 'positive' as const,
    },
    {
      title: 'Avg Deal Value',
      value: '$19,437',
      trend: '-2.4%',
      icon: '📊',
      trendType: 'negative' as const,
    },
    {
      title: 'Sales Orders',
      value: '1,420',
      trend: '+5.2%',
      icon: '🛒',
      trendType: 'positive' as const,
    },
    {
      title: 'Receivables',
      value: '$342,100',
      trend: '-1.2%',
      icon: '💰',
      trendType: 'negative' as const,
    },
    {
      title: 'Active Customers',
      value: '842',
      trend: '+42',
      icon: '👤',
      trendType: 'positive' as const,
    },
    {
      title: 'Inactive Customers',
      value: '156',
      trend: '-12',
      icon: '👥',
      trendType: 'negative' as const,
    },
    {
      title: 'Avg Customer Value',
      value: '$5,725',
      trend: '+0.8%',
      icon: '📈',
      trendType: 'positive' as const,
    },
    {
      title: 'Retention Rate',
      value: '94.8%',
      trend: '+1.5%',
      icon: '🔁',
      trendType: 'positive' as const,
    },
    {
      title: 'Pipeline Deals',
      value: '121',
      trend: '+8',
      icon: '📊',
      trendType: 'positive' as const,
    },
    {
      title: 'Pipeline Value',
      value: '$2.84M',
      trend: '+15%',
      icon: '📈',
      trendType: 'positive' as const,
    },
    {
      title: 'Conversion Rate',
      value: '18.4%',
      trend: '-0.5%',
      icon: '%',
      trendType: 'negative' as const,
    },
  ];

  salesOrders = [
    {
      id: 'SO-84920',
      customer: 'BlueHorizon',
      date: '2023-11-24',
      amount: '$42,500',
      status: 'Paid',
    },
    {
      id: 'SO-84921',
      customer: 'Nexa Systems',
      date: '2023-11-24',
      amount: '$18,200',
      status: 'Pending',
    },
    {
      id: 'SO-84922',
      customer: 'Vertex Media',
      date: '2023-11-23',
      amount: '$6,800',
      status: 'Paid',
    },
    {
      id: 'SO-84923',
      customer: 'Kinetico Ltd',
      date: '2023-11-23',
      amount: '$124,000',
      status: 'Overdue',
    },
    {
      id: 'SO-84924',
      customer: 'Skyline Ventures',
      date: '2023-11-22',
      amount: '$31,450',
      status: 'Paid',
    },
  ];

  topSales = [
    { name: 'Sarah Jenkins', amount: '$1.2M' },
    { name: 'David Chen', amount: '$980K' },
    { name: 'Elena Rodriguez', amount: '$840K' },
  ];

  highValueDeals = [
    {
      opportunity: 'Acme Corp Expansion',
      value: '$450,000',
      stage: 'Negotiation',
      confidence: '85%',
    },
    {
      opportunity: 'Global Logistics SaaS',
      value: '$280,000',
      stage: 'Proposal',
      confidence: '60%',
    },
    {
      opportunity: 'TechFlow Infrastructure',
      value: '$195,000',
      stage: 'Closing',
      confidence: '95%',
    },
    {
      opportunity: 'Summit Health CRM',
      value: '$150,000',
      stage: 'Negotiation',
      confidence: '75%',
    },
    { opportunity: 'Omni Retail POS', value: '$120,000', stage: 'Discovery', confidence: '40%' },
  ];

  regionalConversions = [
    {
      region: 'North America',
      value: '24.5%',
      trend: '+1.2%',
      progress: 78,
      trendType: 'positive' as const,
    },
    {
      region: 'Europe / EMEA',
      value: '18.2%',
      trend: '+0.5%',
      progress: 58,
      trendType: 'positive' as const,
    },
    {
      region: 'Asia Pacific',
      value: '21.8%',
      trend: '-2.1%',
      progress: 66,
      trendType: 'negative' as const,
    },
    {
      region: 'Latin America',
      value: '14.9%',
      trend: '+3.4%',
      progress: 46,
      trendType: 'positive' as const,
    },
  ];

  commonChartOptions: ChartConfiguration['options'] = {
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

  simpleBarOptions: ChartConfiguration['options'] = {
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
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  lineOptions: ChartConfiguration['options'] = {
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
        beginAtZero: false,
      },
    },
  };

  revenueChartType: 'bar' = 'bar';
  revenueChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [450, 520, 480, 610, 590, 720],
        label: 'Actual',
        backgroundColor: '#5b61f6',
      },
      {
        data: [420, 450, 460, 490, 520, 560],
        label: 'Target',
        backgroundColor: '#c9c5f7',
      },
    ],
  };

  pipelineChartType: 'bar' = 'bar';
  pipelineChartData: ChartData<'bar'> = {
    labels: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closing'],
    datasets: [
      {
        data: [100, 70, 50, 30, 15],
        label: 'Deals',
        backgroundColor: '#f59e0b',
      },
    ],
  };

  retentionChartType: 'line' = 'line';
  retentionChartData: ChartData<'line'> = {
    labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: [92, 94, 91, 95, 93, 96],
        label: 'Retention',
        fill: true,
        tension: 0.4,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.2)',
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

    pdf.save('crm-sales-dashboard.pdf');
  }

  exportAsExcel(): void {
    this.isExportMenuOpen = false;

    const rows = this.buildExportRows();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'CRM Sales');
    XLSX.writeFile(workbook, 'crm-sales-data.xlsx');
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
    link.setAttribute('download', 'crm-sales-data.csv');
    link.click();

    URL.revokeObjectURL(url);
  }

  private buildExportRows(): any[] {
    return [
      ...this.kpis.map((item) => ({
        section: 'KPIs',
        title: item.title,
        value: item.value,
        trend: item.trend,
      })),
      ...this.topSales.map((item) => ({
        section: 'Top Sales Representatives',
        name: item.name,
        amount: item.amount,
      })),
      ...this.highValueDeals.map((item) => ({
        section: 'High Value Deals',
        opportunity: item.opportunity,
        value: item.value,
        stage: item.stage,
        confidence: item.confidence,
      })),
      ...this.salesOrders.map((item) => ({
        section: 'Orders and Invoices',
        id: item.id,
        customer: item.customer,
        date: item.date,
        amount: item.amount,
        status: item.status,
      })),
      ...this.regionalConversions.map((item) => ({
        section: 'Regional Conversion Rates',
        region: item.region,
        value: item.value,
        trend: item.trend,
      })),
    ];
  }
}
