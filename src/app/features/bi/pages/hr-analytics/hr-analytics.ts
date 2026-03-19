import { Component } from '@angular/core';
import {
  Chart,
  registerables,
  ChartConfiguration,
  ChartData,
  ChartType
} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { PageFilters } from '../../../../layout/page-filters/page-filters';
import { SectionTitleComponent } from '../../components/section-title/section-title';
import { KpiCardComponent } from '../../components/kpi-card/kpi-card';

Chart.register(...registerables);

@Component({
  selector: 'app-hr-analytics',
  imports: [
    PageFilters,
    SectionTitleComponent,
    KpiCardComponent,
    BaseChartDirective
  ],
  templateUrl: './hr-analytics.html',
  styleUrl: './hr-analytics.css'
})
export class HrAnalyticsComponent {
  workforceKpis = [
    { title: 'Total Employees', value: '1,482', trend: '+12%', icon: '👥', trendType: 'positive' as const },
    { title: 'Active Employees', value: '1,412', trend: '+5', icon: '🟢', trendType: 'positive' as const },
    { title: 'Inactive Employees', value: '70', trend: '-2.4%', icon: '⚪', trendType: 'negative' as const },
    { title: 'Employees Onboarding', value: '48', trend: '+12', icon: '🟠', trendType: 'positive' as const },
    { title: 'Employees Offboarding', value: '14', trend: '-3', icon: '🔴', trendType: 'negative' as const },
    { title: 'Average Tenure', value: '4.2 Yrs', trend: '+0.3', icon: '📅', trendType: 'positive' as const },
    { title: 'Attrition Rate', value: '8.4%', trend: '-1.2%', icon: '📉', trendType: 'negative' as const }
  ];

  attendanceKpis = [
    { title: 'Presence Rate', value: '94.2%', trend: '+0.5%', icon: '🟡', trendType: 'positive' as const },
    { title: 'Attendance Rate', value: '96.8%', trend: '+1.2%', icon: '🟢', trendType: 'positive' as const },
    { title: 'Absence Rate', value: '3.2%', trend: '-0.4%', icon: '📛', trendType: 'negative' as const },
    { title: 'Late Check-ins', value: '128', trend: '+12', icon: '🕒', trendType: 'negative' as const },
    { title: 'Overtime Hours', value: '2,480', trend: '+15%', icon: '⚡', trendType: 'positive' as const }
  ];

  payrollKpis = [
    { title: 'Total Payroll', value: '$4.2M', trend: '+2.1%', icon: '💵', trendType: 'positive' as const },
    { title: 'Avg. Salary', value: '$84.5k', trend: '+$1.2k', icon: '💳', trendType: 'positive' as const },
    { title: 'Avg. Cost / EE', value: '$102k', trend: '+0.8%', icon: '📈', trendType: 'positive' as const },
    { title: 'Payroll Variance', value: '-$12k', trend: 'Under Budget', icon: '⭕', trendType: 'positive' as const }
  ];

  recruitmentKpis = [
    { title: 'Active Job Offers', value: '24', trend: '12 Open', icon: '🏢', trendType: 'positive' as const },
    { title: 'Total Apps', value: '2.4k', trend: '+450', icon: '📄', trendType: 'positive' as const },
    { title: 'Conversion Rate', value: '3.5%', trend: '-0.2%', icon: '%', trendType: 'negative' as const },
    { title: 'Recruitment Index', value: '92/100', trend: 'Exceptional', icon: '📊', trendType: 'positive' as const }
  ];

  footerKpis = [
    { title: 'Hired Applications', value: '72', trend: '+12%', icon: '🔵', trendType: 'positive' as const },
    { title: 'Late Arrival Penalty', value: '$2,400', trend: 'Cost Impact', icon: '💲', trendType: 'negative' as const },
    { title: 'Application Quality', value: 'High', trend: '+15%', icon: '📈', trendType: 'positive' as const },
    { title: 'Efficiency Index', value: '8.4', trend: 'Standard: 7.0', icon: '⚡', trendType: 'positive' as const }
  ];

  birthdays = [
    { name: 'Johnathan Smith', department: 'Logistics', days: 1 },
    { name: 'Sarah Jenkins', department: 'Tech Support', days: 3 },
    { name: 'Robert Fox', department: 'Engineering', days: 3 },
    { name: 'Emily Davis', department: 'Warehouse', days: 4 },
    { name: 'Michael Cho', department: 'Sales', days: 6 }
  ];

  commonChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true
      }
    }
  };

  headcountChartType: ChartType = 'line';
  headcountChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        data: [1180, 1195, 1210, 1225, 1240, 1255, 1270, 1285],
        label: 'Headcount',
        tension: 0.35,
        fill: true,
        borderColor: '#5b61f6',
        backgroundColor: 'rgba(91, 97, 246, 0.18)'
      }
    ]
  };

  tenureChartType: ChartType = 'doughnut';
  tenureChartData: ChartData<'doughnut'> = {
    labels: ['0-2 years', '3-5 years', '6-10 years', '10+ years'],
    datasets: [
      {
        data: [420, 360, 290, 180],
        backgroundColor: ['#2f66f5', '#4b8df8', '#7aa5ff', '#5b61f6']
      }
    ]
  };

  attendanceChartType: ChartType = 'line';
  attendanceChartData: ChartData<'line'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        data: [120, 145, 160, 130, 90],
        label: 'Presence',
        tension: 0.35,
        fill: true,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.16)'
      },
      {
        data: [92, 94, 93, 95, 89],
        label: 'Overtime',
        tension: 0.35,
        fill: false,
        borderColor: '#5b61f6'
      }
    ]
  };

  salaryChartType: ChartType = 'bar';
  salaryChartData: ChartData<'bar'> = {
    labels: ['Engineering', 'Product', 'Sales', 'Marketing', 'HR & Ops'],
    datasets: [
      {
        data: [105000, 98000, 86000, 74000, 69000],
        label: 'Average Salary',
        backgroundColor: '#5b61f6'
      }
    ]
  };

  hiringFunnelChartType: ChartType = 'bar';
  hiringFunnelChartData: ChartData<'bar'> = {
    labels: ['Applications', 'Screening', 'Technical', 'Offer', 'Hired'],
    datasets: [
      {
        data: [2450, 1200, 450, 85, 72],
        label: 'Candidates',
        backgroundColor: '#f59e0b'
      }
    ]
  };
}