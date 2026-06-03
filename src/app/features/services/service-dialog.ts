import { Component, signal, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../core/models/api-error.model';
import { ClinicService } from '../../core/models/service.model';
import { TeamMember } from '../../core/models/user.model';
import { ServiceCatalogService } from '../../core/services/service-catalog.service';
import { TeamService } from '../../core/services/team.service';
import { DIALOG_DATA, DialogRef } from '../../shared/ui/dialog/dialog.tokens';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { SpinnerComponent } from '../../shared/ui/spinner';
import { SelectComponent } from '../../shared/ui/select';
import { SPECIALTY_OPTIONS, DentalSpecialty } from '../../core/utils/specialty.util';

@Component({
  selector: 'app-service-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerComponent, SelectComponent],
  templateUrl: './service-dialog.html',
})
export class ServiceDialogComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private service = inject(ServiceCatalogService);
  private team    = inject(TeamService);
  private toast   = inject(ToastService);
  private ref     = inject(DialogRef);
  private readonly existing = inject(DIALOG_DATA) as ClinicService | null;

  readonly loading = signal(false);
  readonly isEdit  = signal(!!this.existing);
  readonly specialties = SPECIALTY_OPTIONS;

  readonly dentists = signal<TeamMember[]>([]);
  readonly selectedDentists = signal<Set<string>>(new Set(this.existing?.dentistIds ?? []));

  form = this.fb.nonNullable.group({
    name:            [this.existing?.name ?? '', Validators.required],
    category:        [(this.existing?.category ?? 'GENERAL') as DentalSpecialty, Validators.required],
    durationMinutes: [this.existing?.durationMinutes ?? 30, [Validators.required, Validators.min(10), Validators.max(480)]],
    price:           [this.existing?.price ?? (null as number | null), [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    this.team.list().subscribe(members => {
      const dentists = members.filter(m => m.role === 'DENTIST');
      this.dentists.set(dentists);
      // new service: pre-select every dentist (clinic can uncheck those who don't perform it)
      if (!this.existing) this.selectedDentists.set(new Set(dentists.map(d => d.id)));
    });
  }

  isChecked(id: string): boolean { return this.selectedDentists().has(id); }

  toggleDentist(id: string) {
    this.selectedDentists.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  save() {
    if (this.form.invalid || this.loading()) return;
    const v = this.form.getRawValue();
    const payload = {
      name: v.name,
      category: v.category,
      durationMinutes: v.durationMinutes,
      price: v.price!,
      dentistIds: [...this.selectedDentists()],
    };
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
