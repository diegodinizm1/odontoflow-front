import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Charge } from '../../core/models/charge.model';
import { ChargeService } from '../../core/services/charge.service';
import { DialogService } from '../../shared/ui/dialog/dialog.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { SpinnerComponent } from '../../shared/ui/spinner';
import { ChargeDialogComponent } from '../financial/charge-dialog';

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, SpinnerComponent],
  templateUrl: './charges.html',
})
export class ChargesComponent implements OnInit {
  private service = inject(ChargeService);
  private dialog  = inject(DialogService);
  private toast   = inject(ToastService);

  readonly loading = signal(true);
  readonly charges = signal<Charge[]>([]);

  readonly pending = computed(() => this.charges().filter(c => c.status === 'PENDING'));

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.list().subscribe({
      next: data => { this.charges.set(data); this.loading.set(false); },
      error: () => { this.toast.open('Erro ao carregar cobranças.', 'Fechar'); this.loading.set(false); },
    });
  }

  openCreate() {
    this.dialog.open(ChargeDialogComponent, { width: '440px' })
      .afterClosed().subscribe(changed => { if (changed) this.load(); });
  }

  markPaid(c: Charge) {
    this.service.updateStatus(c.id, 'PAID').subscribe({
      next: () => { this.toast.open('Cobrança marcada como paga.'); this.load(); },
      error: () => this.toast.open('Erro ao atualizar cobrança.', 'Fechar'),
    });
  }
}
