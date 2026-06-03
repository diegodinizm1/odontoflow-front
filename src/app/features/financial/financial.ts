import { Component, signal, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Charge, ChargeStatus, FinancialSummary } from '../../core/models/charge.model';
import { ChargeService } from '../../core/services/charge.service';
import { ChargeDialogComponent } from './charge-dialog';
import { DialogService } from '../../shared/ui/dialog/dialog.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { SpinnerComponent } from '../../shared/ui/spinner';
import { MenuComponent } from '../../shared/ui/menu';

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [CurrencyPipe, SpinnerComponent, MenuComponent],
  templateUrl: './financial.html',
})
export class FinancialComponent implements OnInit {
  private service  = inject(ChargeService);
  private dialog   = inject(DialogService);
  private toast    = inject(ToastService);

  readonly loading = signal(true);
  readonly charges = signal<Charge[]>([]);
  readonly summary = signal<FinancialSummary | null>(null);

  readonly columns = ['patient', 'description', 'amount', 'status', 'actions'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.list().subscribe({
      next: data => { this.charges.set(data); this.loading.set(false); },
      error: () => { this.toast.open('Erro ao carregar cobranças.', 'Fechar'); this.loading.set(false); },
    });
    this.service.summary().subscribe({ next: s => this.summary.set(s), error: () => {} });
  }

  openCreate() {
    this.dialog.open(ChargeDialogComponent, { width: '440px' })
      .afterClosed().subscribe(changed => { if (changed) this.load(); });
  }

  setStatus(charge: Charge, status: ChargeStatus) {
    this.service.updateStatus(charge.id, status).subscribe({
      next: () => this.load(),
      error: () => this.toast.open('Erro ao atualizar cobrança.', 'Fechar'),
    });
  }

  statusLabel(s: ChargeStatus): string {
    return { PENDING: 'Pendente', PAID: 'Pago', CANCELED: 'Cancelado' }[s];
  }
}
