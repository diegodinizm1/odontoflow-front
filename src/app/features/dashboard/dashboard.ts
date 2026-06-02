import { Component, signal, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashboardSummary } from '../../core/models/dashboard.model';
import { Appointment } from '../../core/models/appointment.model';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  private service  = inject(DashboardService);
  private snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly data    = signal<DashboardSummary | null>(null);
  readonly today   = new Date();

  ngOnInit() {
    this.service.summary().subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => { this.snackBar.open('Erro ao carregar o painel.', 'Fechar', { duration: 3000 }); this.loading.set(false); },
    });
  }

  time(iso: string): string {
    return (iso.split('T')[1] ?? '00:00').slice(0, 5);
  }

  statusLabel(a: Appointment): string {
    return { SCHEDULED: 'Agendada', COMPLETED: 'Concluída', CANCELED: 'Cancelada' }[a.status];
  }
}
