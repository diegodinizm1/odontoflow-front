import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Patient } from '../../core/models/patient.model';
import { ApiError } from '../../core/models/api-error.model';
import { PatientService } from '../../core/services/patient.service';
import { ChargeService } from '../../core/services/charge.service';
import { DialogRef } from '../../shared/ui/dialog/dialog.tokens';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { SelectComponent } from '../../shared/ui/select';
import { SpinnerComponent } from '../../shared/ui/spinner';

@Component({
  selector: 'app-charge-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, SelectComponent, SpinnerComponent],
  templateUrl: './charge-dialog.html',
})
export class ChargeDialogComponent implements OnInit {
  private fb       = inject(FormBuilder);
  private patients = inject(PatientService);
  private charges  = inject(ChargeService);
  private toast    = inject(ToastService);
  private ref      = inject(DialogRef);

  readonly loading     = signal(false);
  readonly patientList = signal<Patient[]>([]);
  readonly patientOptions = computed(() =>
    this.patientList().map(p => ({ value: p.id, label: p.fullName })));

  form = this.fb.nonNullable.group({
    patientId:   ['', Validators.required],
    description: ['', Validators.required],
    amount:      [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  ngOnInit() {
    this.patients.list().subscribe(list => this.patientList.set(list));
  }

  save() {
    if (this.form.invalid || this.loading()) return;
    const v = this.form.getRawValue();
    this.loading.set(true);
    this.charges.create({ patientId: v.patientId, description: v.description, amount: v.amount! }).subscribe({
      next: () => { this.toast.open('Cobrança criada.'); this.ref.close(true); },
      error: (err: HttpErrorResponse) => {
        const api = err.error as ApiError;
        this.toast.open(api?.message ?? 'Erro ao criar cobrança.', 'Fechar', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }

  close() { this.ref.close(false); }
}
