import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { DashboardSummary } from '../../core/models/dashboard.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { SpinnerComponent } from '../../shared/ui/spinner';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './settings.html',
})
export class SettingsComponent implements OnInit {
  private service = inject(DashboardService);
  private toast   = inject(ToastService);

  readonly loading = signal(true);
  readonly data    = signal<DashboardSummary | null>(null);

  readonly bookingUrl = computed(() => {
    const slug = this.data()?.publicSlug;
    return slug ? `${location.origin}/agendar/${slug}` : '';
  });

  ngOnInit() {
    this.service.summary().subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => { this.toast.open('Erro ao carregar configurações.', 'Fechar'); this.loading.set(false); },
    });
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
