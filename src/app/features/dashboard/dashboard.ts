import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardSummary } from '../../core/models/dashboard.model';
import { Appointment } from '../../core/models/appointment.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { SpinnerComponent } from '../../shared/ui/spinner';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink, SpinnerComponent],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  private service  = inject(DashboardService);
  private auth     = inject(AuthService);
  private toast    = inject(ToastService);

  readonly isDentist = computed(() => this.auth.currentUser()?.role === 'DENTIST');

  readonly loading = signal(true);
  readonly data    = signal<DashboardSummary | null>(null);
  readonly today   = new Date();

  // Shareable public online-booking link for this clinic.
  readonly bookingUrl = computed(() => {
    const slug = this.data()?.publicSlug;
    return slug ? `${location.origin}/agendar/${slug}` : '';
  });

  ngOnInit() {
    this.service.summary().subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => { this.toast.open('Erro ao carregar o painel.', 'Fechar'); this.loading.set(false); },
    });
  }

  time(iso: string): string {
    return (iso.split('T')[1] ?? '00:00').slice(0, 5);
  }

  statusLabel(a: Appointment): string {
    return { PENDING: 'Pendente', SCHEDULED: 'Agendada', COMPLETED: 'Concluída', CANCELED: 'Cancelada' }[a.status];
  }

  copyLink() {
    const url = this.bookingUrl();
    if (!url) return;
    navigator.clipboard.writeText(url).then(
      () => this.toast.open('Link copiado!', '', { duration: 2500 }),
      () => this.toast.open('Não foi possível copiar o link.', 'Fechar'),
    );
  }
}
