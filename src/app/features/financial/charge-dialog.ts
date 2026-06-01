import { Component, signal, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Patient } from '../../core/models/patient.model';
import { ApiError } from '../../core/models/api-error.model';
import { PatientService } from '../../core/services/patient.service';
import { ChargeService } from '../../core/services/charge.service';

@Component({
  selector: 'app-charge-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './charge-dialog.html',
})
export class ChargeDialogComponent implements OnInit {
  private fb       = inject(FormBuilder);
  private patients = inject(PatientService);
  private charges  = inject(ChargeService);
  private snackBar = inject(MatSnackBar);
  private ref      = inject(MatDialogRef<ChargeDialogComponent>);

  readonly loading     = signal(false);
  readonly patientList = signal<Patient[]>([]);

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
      next: () => { this.snackBar.open('Cobrança criada.', '', { duration: 3000 }); this.ref.close(true); },
      error: (err: HttpErrorResponse) => {
        const api = err.error as ApiError;
        this.snackBar.open(api?.message ?? 'Erro ao criar cobrança.', 'Fechar', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }

  close() { this.ref.close(false); }
}
