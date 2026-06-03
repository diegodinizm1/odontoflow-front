import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../core/models/api-error.model';
import { ClinicService } from '../../core/models/service.model';
import { ServiceCatalogService } from '../../core/services/service-catalog.service';
import { DIALOG_DATA, DialogRef } from '../../shared/ui/dialog/dialog.tokens';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { SpinnerComponent } from '../../shared/ui/spinner';

@Component({
  selector: 'app-service-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerComponent],
  templateUrl: './service-dialog.html',
})
export class ServiceDialogComponent {
  private fb      = inject(FormBuilder);
  private service = inject(ServiceCatalogService);
  private toast   = inject(ToastService);
  private ref     = inject(DialogRef);
  private readonly existing = inject(DIALOG_DATA) as ClinicService | null;

  readonly loading = signal(false);
  readonly isEdit  = signal(!!this.existing);

  form = this.fb.nonNullable.group({
    name:            [this.existing?.name ?? '', Validators.required],
    durationMinutes: [this.existing?.durationMinutes ?? 30, [Validators.required, Validators.min(10), Validators.max(480)]],
    price:           [this.existing?.price ?? (null as number | null), [Validators.required, Validators.min(0)]],
  });

  save() {
    if (this.form.invalid || this.loading()) return;
    const v = this.form.getRawValue();
    const payload = { name: v.name, durationMinutes: v.durationMinutes, price: v.price! };
    this.loading.set(true);
    const req$ = this.existing
      ? this.service.update(this.existing.id, payload)
      : this.service.create(payload);
    req$.subscribe({
      next: () => { this.toast.open(this.existing ? 'Serviço atualizado.' : 'Serviço criado.'); this.ref.close(true); },
      error: (err: HttpErrorResponse) => {
        const api = err.error as ApiError;
        this.toast.open(api?.message ?? 'Erro ao salvar serviço.', 'Fechar', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }

  close() { this.ref.close(false); }
}
