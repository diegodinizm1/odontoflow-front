import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center gap-4">
      <mat-icon class="text-primary-700 text-5xl">medical_services</mat-icon>
      <h1 class="text-2xl font-bold text-slate-800">Bem-vindo ao OdontoFlow</h1>
      <p class="text-slate-500">Logado como <strong>{{ auth.currentUser()?.email }}</strong></p>
      <button mat-stroked-button (click)="auth.logout()">
        <mat-icon>logout</mat-icon> Sair
      </button>
    </div>
  `,
})
export class DashboardComponent {
  auth = inject(AuthService);
}
