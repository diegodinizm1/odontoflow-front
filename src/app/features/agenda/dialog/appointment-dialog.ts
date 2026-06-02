import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Patient } from '../../../core/models/patient.model';
import { Appointment } from '../../../core/models/appointment.model';
import { TeamMember } from '../../../core/models/user.model';
import { PatientService } from '../../../core/services/patient.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { TeamService } from '../../../core/services/team.service';
import { ApiError } from '../../../core/models/api-error.model';
import { addMinutesToTime, timeOf, toLocalIso } from '../../../core/utils/datetime.util';

export interface AppointmentDialogData {
  appointment?: Appointment;
  defaultDate?: Date;
  defaultTime?: string;
  defaultDentistId?: string;
}

@Component({
  selector: 'app-appointment-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './appointment-dialog.html',
})
export class AppointmentDialogComponent implements OnInit {
  private fb       = inject(FormBuilder);
  private patients = inject(PatientService);
  private service  = inject(AppointmentService);
  private auth     = inject(AuthService);
  private team     = inject(TeamService);
  private snackBar = inject(MatSnackBar);
  private ref      = inject(MatDialogRef<AppointmentDialogComponent>);
  readonly data: AppointmentDialogData = inject(MAT_DIALOG_DATA);

  readonly loading     = signal(false);
  readonly patientList = signal<Patient[]>([]);
  readonly dentists    = signal<TeamMember[]>([]);
  readonly isEdit      = signal(false);
  readonly times       = this.buildTimes();

  // Receptionists must pick the dentist; dentists implicitly schedule for themselves.
  readonly isReceptionist = computed(() => this.auth.currentUser()?.role === 'RECEPTIONIST');

  form = this.fb.nonNullable.group({
    patientId: ['', Validators.required],
    dentistId: [''],
    date:      [new Date() as Date | null, Validators.required],
    startTime: ['09:00', Validators.required],
    endTime:   ['10:00', Validators.required],
  });

  ngOnInit() {
    this.patients.list().subscribe(list => this.patientList.set(list));

    const appt = this.data.appointment;
    if (appt) {
      this.isEdit.set(true);
      this.form.patchValue({
        patientId: appt.patientId,
        dentistId: appt.dentistId,
        date: new Date(appt.startTime),
        startTime: timeOf(appt.startTime),
        endTime: timeOf(appt.endTime),
      });
      this.form.controls.patientId.disable();
    } else {
      if (this.data.defaultDate) this.form.controls.date.setValue(this.data.defaultDate);
      if (this.data.defaultTime) {
        this.form.controls.startTime.setValue(this.data.defaultTime);
        this.form.controls.endTime.setValue(addMinutesToTime(this.data.defaultTime, 60));
      }
      if (this.isReceptionist()) {
        this.form.controls.dentistId.addValidators(Validators.required);
        if (this.data.defaultDentistId) this.form.controls.dentistId.setValue(this.data.defaultDentistId);
        this.team.list().subscribe(members =>
          this.dentists.set(members.filter(m => m.role === 'DENTIST')));
      }
    }
  }

  onStartChange(value: string) {
    const end = this.form.controls.endTime.value;
    if (end <= value) {
      this.form.controls.endTime.setValue(addMinutesToTime(value, 60));
    }
  }

  save() {
    if (this.form.invalid || this.loading()) return;
    const v = this.form.getRawValue();
    if (v.endTime <= v.startTime) {
      this.snackBar.open('O término deve ser após o início.', 'Fechar', { duration: 3000 });
      return;
    }
    const date = v.date!;
    const startTime = toLocalIso(date, v.startTime);
    const endTime = toLocalIso(date, v.endTime);

    this.loading.set(true);
    const appt = this.data.appointment;
    const req$ = appt
      ? this.service.reschedule(appt.id, { startTime, endTime })
      : this.service.create({ patientId: v.patientId, dentistId: v.dentistId || null, startTime, endTime });

    req$.subscribe({
      next: () => { this.snackBar.open(appt ? 'Consulta reagendada.' : 'Consulta agendada.', '', { duration: 3000 }); this.ref.close(true); },
      error: (err: HttpErrorResponse) => {
        const api = err.error as ApiError;
        this.snackBar.open(api?.message ?? 'Erro ao salvar consulta.', 'Fechar', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }

  cancelAppointment() {
    const appt = this.data.appointment;
    if (!appt || !confirm('Cancelar esta consulta?')) return;
    this.loading.set(true);
    this.service.updateStatus(appt.id, 'CANCELED').subscribe({
      next: () => { this.snackBar.open('Consulta cancelada.', '', { duration: 3000 }); this.ref.close(true); },
      error: () => { this.snackBar.open('Erro ao cancelar.', 'Fechar', { duration: 3000 }); this.loading.set(false); },
    });
  }

  complete() {
    const appt = this.data.appointment;
    if (!appt) return;
    this.loading.set(true);
    this.service.updateStatus(appt.id, 'COMPLETED').subscribe({
      next: () => { this.snackBar.open('Consulta concluída.', '', { duration: 3000 }); this.ref.close(true); },
      error: () => { this.snackBar.open('Erro ao concluir.', 'Fechar', { duration: 3000 }); this.loading.set(false); },
    });
  }

  close() { this.ref.close(false); }

  private buildTimes(): string[] {
    const out: string[] = [];
    for (let h = 7; h <= 20; h++) {
      out.push(`${String(h).padStart(2, '0')}:00`);
      out.push(`${String(h).padStart(2, '0')}:30`);
    }
    return out;
  }
}
