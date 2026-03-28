import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { OverviewComponent } from './features/bi/pages/overview/overview';
import { HrAnalyticsComponent } from './features/bi/pages/hr-analytics/hr-analytics';
import { FinanceAnalyticsComponent } from './features/bi/pages/finance-analytics/finance-analytics';
import { CrmSalesComponent } from './features/bi/pages/crm-sales/crm-sales';
import { ReportsComponent } from './features/bi/pages/reports/reports';
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'hr-analytics', component: HrAnalyticsComponent },
      { path: 'finance-analytics', component: FinanceAnalyticsComponent },
      { path: 'crm-sales', component: CrmSalesComponent },
      { path: 'reports', component: ReportsComponent },
    ],
  },
];
