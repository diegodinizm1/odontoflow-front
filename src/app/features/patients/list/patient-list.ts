import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Patient } from '../../../core/models/patient.model';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    RouterLink, DatePipe, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './patient-list.html',
})
export class PatientListComponent implements OnInit {
  private patientService = inject(PatientService);
  private snackBar       = inject(MatSnackBar);

  readonly patients = signal<Patient[]>([]);
  readonly loading  = signal(true);
  readonly search   = signal('');

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const list = this.patients();
    if (!term) return list;
    return list.filter(p =>
      p.fullName.toLowerCase().includes(term) ||
      (p.medicalAlerts?.toLowerCase().includes(term) ?? false));
  });

  readonly columns = ['patient', 'dateOfBirth', 'medicalAlerts', 'actions'];

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

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
