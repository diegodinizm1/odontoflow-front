import { Component, signal, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PatientService } from '../../../core/services/patient.service';
import { ApiError } from '../../../core/models/api-error.model';
import { MaskDirective } from '../../../core/directives/mask.directive';
import { DatepickerComponent } from '../../../shared/ui/datepicker';
import { SpinnerComponent } from '../../../shared/ui/spinner';
import { TooltipDirective } from '../../../shared/ui/tooltip.directive';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, MaskDirective,
    DatepickerComponent, SpinnerComponent, TooltipDirective,
  ],
  templateUrl: './patient-form.html',
})
export class PatientFormComponent implements OnInit {
  private fb             = inject(FormBuilder);
  private patientService = inject(PatientService);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private toast          = inject(ToastService);

  readonly loading  = signal(false);
  readonly isEdit   = signal(false);
  private patientId = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    fullName:      ['', Validators.required],
    phone:         [''],
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
          phone:         p.phone ?? '',
          dateOfBirth:   p.dateOfBirth ? new Date(p.dateOfBirth) : null,
          medicalAlerts: p.medicalAlerts ?? '',
        }),
        error: () => { this.toast.open('Paciente não encontrado.', 'Fechar', { duration: 3000 }); this.router.navigate(['/patients']); },
      });
    }
  }

  submit() {
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    const raw = this.form.getRawValue();
    const payload = {
      fullName:      raw.fullName,
      phone:         raw.phone || null,
      dateOfBirth:   raw.dateOfBirth ? raw.dateOfBirth.toISOString().split('T')[0] : null,
      medicalAlerts: raw.medicalAlerts || null,
    };

    const request$ = this.isEdit()
      ? this.patientService.update(this.patientId()!, payload)
      : this.patientService.create(payload);

    request$.subscribe({
      next: () => {
        this.toast.open(this.isEdit() ? 'Paciente atualizado.' : 'Paciente cadastrado.', '', { duration: 3000 });
        this.router.navigate(['/patients']);
      },
      error: (err: HttpErrorResponse) => {
        const api = err.error as ApiError;
        this.toast.open(api?.message ?? 'Erro ao salvar paciente.', 'Fechar', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }
}
