import { Component, signal, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Charge, ChargeStatus, FinancialSummary } from '../../core/models/charge.model';
import { ChargeService } from '../../core/services/charge.service';
import { ChargeDialogComponent } from './charge-dialog';

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [
    CurrencyPipe, DatePipe,
    MatTableModule, MatButtonModule, MatIconModule, MatMenuModule, MatProgressSpinnerModule,
  ],
  templateUrl: './financial.html',
})
export class FinancialComponent implements OnInit {
  private service  = inject(ChargeService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly charges = signal<Charge[]>([]);
  readonly summary = signal<FinancialSummary | null>(null);

  readonly columns = ['patient', 'description', 'amount', 'status', 'actions'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.list().subscribe({
      next: data => { this.charges.set(data); this.loading.set(false); },
      error: () => { this.snackBar.open('Erro ao carregar cobranças.', 'Fechar', { duration: 3000 }); this.loading.set(false); },
    });
    this.service.summary().subscribe({ next: s => this.summary.set(s), error: () => {} });
  }

  openCreate() {
    this.dialog.open(ChargeDialogComponent, { width: '440px', autoFocus: false })
      .afterClosed().subscribe(changed => { if (changed) this.load(); });
  }

  setStatus(charge: Charge, status: ChargeStatus) {
    this.service.updateStatus(charge.id, status).subscribe({
      next: () => this.load(),
      error: () => this.snackBar.open('Erro ao atualizar cobrança.', 'Fechar', { duration: 3000 }),
    });
  }

  statusLabel(s: ChargeStatus): string {
    return { PENDING: 'Pendente', PAID: 'Pago', CANCELED: 'Cancelado' }[s];
  }
}
