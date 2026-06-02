import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ShellComponent } from './features/shell/shell';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      { path: 'login',    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent) },
    ],
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'inicio',            loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent) },
      { path: 'agenda',            loadComponent: () => import('./features/agenda/agenda').then(m => m.AgendaComponent) },
      { path: 'patients',          loadComponent: () => import('./features/patients/list/patient-list').then(m => m.PatientListComponent) },
      { path: 'patients/new',      loadComponent: () => import('./features/patients/form/patient-form').then(m => m.PatientFormComponent) },
      { path: 'patients/:id/edit', loadComponent: () => import('./features/patients/form/patient-form').then(m => m.PatientFormComponent) },
      { path: 'patients/:id',      loadComponent: () => import('./features/patients/prontuario/prontuario').then(m => m.ProntuarioComponent) },
      { path: 'financeiro',        loadComponent: () => import('./features/financial/financial').then(m => m.FinancialComponent) },
      { path: 'assinatura',        loadComponent: () => import('./features/billing/billing').then(m => m.BillingComponent) },
      { path: 'equipe',            loadComponent: () => import('./features/team/team').then(m => m.TeamComponent) },
      { path: 'bem-vindo',         loadComponent: () => import('./features/onboarding/onboarding').then(m => m.OnboardingComponent) },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];

