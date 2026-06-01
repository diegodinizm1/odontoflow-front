import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Patient } from '../../../core/models/patient.model';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    RouterLink, DatePipe,
    MatTableModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './patient-list.html',
})
export class PatientListComponent implements OnInit {
  private patientService = inject(PatientService);
  private snackBar       = inject(MatSnackBar);
  private dialog         = inject(MatDialog);

  readonly patients = signal<Patient[]>([]);
  readonly loading  = signal(true);

  readonly columns = ['fullName', 'dateOfBirth', 'medicalAlerts', 'actions'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.patientService.list().subscribe({
      next: data => { this.patients.set(data); this.loading.set(false); },
      error: ()   => { this.snackBar.open('Erro ao carregar pacientes.', 'Fechar', { duration: 3000 }); this.loading.set(false); },
    });
  }

  delete(patient: Patient) {
    if (!confirm(`Remover paciente "${patient.fullName}"?`)) return;
    this.patientService.delete(patient.id).subscribe({
      next: () => {
        this.patients.update(list => list.filter(p => p.id !== patient.id));
        this.snackBar.open('Paciente removido.', '', { duration: 3000 });
      },
      error: () => this.snackBar.open('Erro ao remover paciente.', 'Fechar', { duration: 3000 }),
    });
  }
}
