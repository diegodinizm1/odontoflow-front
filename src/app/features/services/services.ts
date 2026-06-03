import { Component, signal, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ClinicService } from '../../core/models/service.model';
import { ServiceCatalogService } from '../../core/services/service-catalog.service';
import { DialogService } from '../../shared/ui/dialog/dialog.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { SpinnerComponent } from '../../shared/ui/spinner';
import { TooltipDirective } from '../../shared/ui/tooltip.directive';
import { ServiceDialogComponent } from './service-dialog';
import { DentalSpecialty, specialtyLabel } from '../../core/utils/specialty.util';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CurrencyPipe, SpinnerComponent, TooltipDirective],
  templateUrl: './services.html',
})
export class ServicesComponent implements OnInit {
  private service = inject(ServiceCatalogService);
  private dialog  = inject(DialogService);
  private toast   = inject(ToastService);

  readonly loading = signal(true);
  readonly services = signal<ClinicService[]>([]);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.list().subscribe({
      next: data => { this.services.set(data); this.loading.set(false); },
      error: () => { this.toast.open('Erro ao carregar serviços.', 'Fechar'); this.loading.set(false); },
    });
  }

  openForm(existing?: ClinicService) {
    this.dialog.open(ServiceDialogComponent, { width: '460px', data: existing ?? null })
      .afterClosed().subscribe(changed => { if (changed) this.load(); });
  }

  categoryLabel(c: DentalSpecialty): string { return specialtyLabel(c); }

  remove(s: ClinicService) {
    if (!confirm(`Remover o serviço "${s.name}"?`)) return;
    this.service.remove(s.id).subscribe({
      next: () => { this.services.update(list => list.filter(x => x.id !== s.id)); this.toast.open('Serviço removido.'); },
      error: () => this.toast.open('Erro ao remover serviço.', 'Fechar'),
    });
  }
}
