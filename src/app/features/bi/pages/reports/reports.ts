import { Component } from '@angular/core';
import { PageFilters } from '../../../../layout/page-filters/page-filters';
import { SectionTitleComponent } from '../../components/section-title/section-title';

@Component({
  selector: 'app-reports',
  imports: [PageFilters, SectionTitleComponent],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class ReportsComponent {
  predefinedReports = [
    {
      title: 'HR Monthly Performance',
      module: 'HR',
      description: 'Attendance, payroll, recruitment, and workforce summary.',
      formats: ['PDF', 'Excel', 'CSV'],
    },
    {
      title: 'Financial Summary',
      module: 'Finance',
      description: 'Revenue, expenses, liabilities, assets, and tax overview.',
      formats: ['PDF', 'Excel', 'CSV'],
    },
    {
      title: 'Sales Pipeline Report',
      module: 'CRM & Sales',
      description: 'Deals, win rate, pipeline stages, and sales orders analysis.',
      formats: ['PDF', 'Excel', 'CSV'],
    },
    {
      title: 'Executive Overview',
      module: 'Overview',
      description: 'Global KPI snapshot across all business domains.',
      formats: ['PDF', 'Excel', 'CSV'],
    },
  ];

  reportHistory = [
    { name: 'Finance Summary - March', date: '2026-03-24', format: 'PDF', status: 'Generated' },
    {
      name: 'HR Monthly Report - February',
      date: '2026-03-22',
      format: 'Excel',
      status: 'Generated',
    },
    { name: 'Sales Pipeline Weekly', date: '2026-03-20', format: 'CSV', status: 'Generated' },
    { name: 'Executive Dashboard Export', date: '2026-03-18', format: 'PDF', status: 'Generated' },
  ];

  selectedMetrics = ['Revenue', 'Net Profit', 'Employees Count', 'Attendance Rate'];
  selectedDimensions = ['Date', 'Department', 'Company'];
  selectedFilters = ['Last 6 Months', 'Active Employees Only', 'Company = REST ERP'];

  scheduledReports = [
    {
      title: 'Weekly Finance Snapshot',
      frequency: 'Every Monday',
      recipients: 'finance@company.com',
      nextRun: '2026-03-30',
      format: 'PDF',
      status: 'Active',
    },
    {
      title: 'Monthly HR Summary',
      frequency: '1st of each month',
      recipients: 'hr@company.com',
      nextRun: '2026-04-01',
      format: 'Excel',
      status: 'Active',
    },
    {
      title: 'Sales Pipeline Digest',
      frequency: 'Every Friday',
      recipients: 'sales@company.com',
      nextRun: '2026-03-27',
      format: 'PDF',
      status: 'Paused',
    },
  ];

  favoriteReports = [
    { title: 'Executive KPI Pack', type: 'Favorite', updated: '2 hours ago' },
    { title: 'Finance Board Report', type: 'Favorite', updated: 'Yesterday' },
    { title: 'HR Workforce Summary', type: 'Shared', updated: '3 days ago' },
    { title: 'CRM Monthly Snapshot', type: 'Recent', updated: 'Last week' },
  ];

  availableMetrics = [
    'Revenue',
    'Net Profit',
    'Expenses',
    'Cash Balance',
    'Employees Count',
    'Attendance Rate',
    'Win Rate',
    'Pipeline Value',
  ];

  availableDimensions = ['Date', 'Department', 'Company', 'Customer', 'Salesperson', 'Region'];

  getStatusClass(status: string): string {
    if (status === 'Active') return 'status-active';
    if (status === 'Paused') return 'status-paused';
    return 'status-default';
  }
}
