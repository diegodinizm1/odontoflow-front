import { Component, signal, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { PatientService } from '../../../core/services/patient.service';
import { ApiError } from '../../../core/models/api-error.model';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatInputModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule,
  ],
  templateUrl: './patient-form.html',
})
export class PatientFormComponent implements OnInit {
  private fb             = inject(FormBuilder);
  private patientService = inject(PatientService);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private snackBar       = inject(MatSnackBar);

  readonly loading  = signal(false);
  readonly isEdit   = signal(false);
  private patientId = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    fullName:      ['', Validators.required],
    dateOfBirth:   [null as Date | null],
    medicalAlerts: [''],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.patientId.set(id);
      this.patientService.getById(id).subscribe({
        next: p => this.form.patchValue({
          fullName:      p.fullName,
          dateOfBirth:   p.dateOfBirth ? new Date(p.dateOfBirth) : null,
          medicalAlerts: p.medicalAlerts ?? '',
        }),
        error: () => { this.snackBar.open('Paciente não encontrado.', 'Fechar', { duration: 3000 }); this.router.navigate(['/patients']); },
      });
    }
  }

  submit() {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    const raw = this.form.getRawValue();
    const payload = {
      fullName:      raw.fullName,
      dateOfBirth:   raw.dateOfBirth ? raw.dateOfBirth.toISOString().split('T')[0] : null,
      medicalAlerts: raw.medicalAlerts || null,
    };

    const request$ = this.isEdit()
      ? this.patientService.update(this.patientId()!, payload)
      : this.patientService.create(payload);

    request$.subscribe({
      next: () => {
        this.snackBar.open(this.isEdit() ? 'Paciente atualizado.' : 'Paciente cadastrado.', '', { duration: 3000 });
        this.router.navigate(['/patients']);
      },
      error: (err: HttpErrorResponse) => {
        const api = err.error as ApiError;
        this.snackBar.open(api?.message ?? 'Erro ao salvar paciente.', 'Fechar', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }
}
