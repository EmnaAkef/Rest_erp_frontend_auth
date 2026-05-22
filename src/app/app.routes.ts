import { Routes } from '@angular/router';

import { MainLayout } from './layout/main-layout/main-layout';
import { LoginComponent } from './auth/pages/login/login';

import { OverviewComponent } from './features/bi/pages/overview/overview';
import { HrAnalyticsComponent } from './features/bi/pages/hr-analytics/hr-analytics';
import { FinanceAnalyticsComponent } from './features/bi/pages/finance-analytics/finance-analytics';
import { CrmSalesComponent } from './features/bi/pages/crm-sales/crm-sales';
import { ReportsComponent } from './features/bi/pages/reports/reports';
import { authGuard } from './auth/guards/auth.guard';
import { RegisterComponent } from './auth/pages/register/register';
import { AdminRegistrationRequestsComponent } from './auth/pages/admin-registration-requests/admin-registration-requests';
import { adminGuard } from './auth/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'hr-analytics', component: HrAnalyticsComponent },
      { path: 'finance-analytics', component: FinanceAnalyticsComponent },
      { path: 'crm-sales', component: CrmSalesComponent },
      { path: 'reports', component: ReportsComponent },
      {
        path: 'admin/registration-requests',
        component: AdminRegistrationRequestsComponent,
        canActivate: [adminGuard],
      },
    ],
  },
];