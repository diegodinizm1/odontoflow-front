import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { ShellComponent } from './features/shell/shell';

export const routes: Routes = [
  { path: '', redirectTo: 'patients', pathMatch: 'full' },
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
      { path: 'patients',          loadComponent: () => import('./features/patients/list/patient-list').then(m => m.PatientListComponent) },
      { path: 'patients/new',      loadComponent: () => import('./features/patients/form/patient-form').then(m => m.PatientFormComponent) },
      { path: 'patients/:id/edit', loadComponent: () => import('./features/patients/form/patient-form').then(m => m.PatientFormComponent) },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];

