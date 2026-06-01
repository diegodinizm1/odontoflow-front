import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Invoice, PlanInfo, Subscription, SubscriptionStatus } from '../../core/models/billing.model';
import { BillingService } from '../../core/services/billing.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './billing.html',
})
export class BillingComponent implements OnInit {
  private service  = inject(BillingService);
  private snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly working = signal('');
  readonly plans = signal<PlanInfo[]>([]);
  readonly subscription = signal<Subscription | null>(null);
  readonly invoices = signal<Invoice[]>([]);

  readonly currentPlan = computed(() => this.subscription()?.plan);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.plans().subscribe({ next: p => this.plans.set(p) });
    this.service.invoices().subscribe({ next: i => this.invoices.set(i) });
    this.service.subscription().subscribe({
      next: s => { this.subscription.set(s); this.loading.set(false); },
      error: () => { this.snackBar.open('Erro ao carregar assinatura.', 'Fechar', { duration: 3000 }); this.loading.set(false); },
    });
  }

  subscribe(plan: PlanInfo) {
    if (this.working()) return;
    this.working.set(plan.code);
    this.service.subscribe(plan.code).subscribe({
      next: s => {
        this.subscription.set(s);
        this.snackBar.open(`Plano ${plan.name} ativado.`, '', { duration: 3000 });
        this.working.set('');
        this.service.invoices().subscribe({ next: i => this.invoices.set(i) });
      },
      error: () => { this.snackBar.open('Erro ao alterar plano.', 'Fechar', { duration: 4000 }); this.working.set(''); },
    });
  }

  cancel() {
    if (!confirm('Cancelar a assinatura atual?')) return;
    this.service.cancel().subscribe({
      next: s => { this.subscription.set(s); this.snackBar.open('Assinatura cancelada.', '', { duration: 3000 }); },
      error: () => this.snackBar.open('Erro ao cancelar.', 'Fechar', { duration: 3000 }),
    });
  }

  statusLabel(s: SubscriptionStatus): string {
    return { TRIALING: 'Em teste', ACTIVE: 'Ativa', PAST_DUE: 'Pagamento pendente', CANCELED: 'Cancelada' }[s];
  }

  limitLabel(n: number): string {
    return n >= 100000 ? 'Ilimitado' : String(n);
  }
}
