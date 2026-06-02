import { Component, signal, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../../core/models/api-error.model';
import { TreatmentService } from '../../../core/services/treatment.service';

@Component({
  selector: 'app-treatment-plan-dialog',
  standalone: true,
  imports: [
    CurrencyPipe, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatTooltipModule, MatProgressSpinnerModule,
  ],
  templateUrl: './treatment-plan-dialog.html',
})
export class TreatmentPlanDialogComponent {
  private fb       = inject(FormBuilder);
  private service  = inject(TreatmentService);
  private snackBar = inject(MatSnackBar);
  private ref      = inject(MatDialogRef<TreatmentPlanDialogComponent>);
  private readonly patientId: string = inject(MAT_DIALOG_DATA).patientId;

  readonly loading = signal(false);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    items: this.fb.array([this.newItem()]),
  });

  get items(): FormArray { return this.form.controls.items; }

  readonly total = signal(0);

  private newItem() {
    const group = this.fb.nonNullable.group({
      description: ['', Validators.required],
      tooth: [''],
      amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    });
    return group;
  }

  addItem() { this.items.push(this.newItem()); }

  removeItem(i: number) {
    if (this.items.length > 1) this.items.removeAt(i);
    this.recomputeTotal();
  }

  recomputeTotal() {
    const sum = this.items.controls
      .reduce((acc, g) => acc + (Number(g.get('amount')?.value) || 0), 0);
    this.total.set(sum);
  }

  save() {
    if (this.form.invalid || this.loading()) return;
    const v = this.form.getRawValue();
    this.loading.set(true);
    this.service.create(this.patientId, {
      title: v.title,
      items: v.items.map(i => ({ description: i.description, tooth: i.tooth || null, amount: i.amount! })),
    }).subscribe({
      next: () => { this.snackBar.open('Plano criado.', '', { duration: 3000 }); this.ref.close(true); },
      error: (err: HttpErrorResponse) => {
        const api = err.error as ApiError;
        this.snackBar.open(api?.message ?? 'Erro ao criar plano.', 'Fechar', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }

  close() { this.ref.close(false); }
}
