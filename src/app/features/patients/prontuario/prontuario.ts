import { Component, signal, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Patient } from '../../../core/models/patient.model';
import { ClinicalRecord, Odontogram } from '../../../core/models/odontogram.model';
import { PatientFile } from '../../../core/models/patient-file.model';
import { ApiError } from '../../../core/models/api-error.model';
import { PatientService } from '../../../core/services/patient.service';
import { ClinicalRecordService } from '../../../core/services/clinical-record.service';
import { PatientFileService } from '../../../core/services/patient-file.service';
import { OdontogramComponent } from './odontogram';

@Component({
  selector: 'app-prontuario',
  standalone: true,
  imports: [
    DatePipe, FormsModule, RouterLink, OdontogramComponent,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './prontuario.html',
})
export class ProntuarioComponent implements OnInit {
  private route    = inject(ActivatedRoute);
  private patients = inject(PatientService);
  private records  = inject(ClinicalRecordService);
  private files    = inject(PatientFileService);
  private snackBar  = inject(MatSnackBar);

  private patientId = '';

  readonly loading  = signal(true);
  readonly saving   = signal(false);
  readonly uploading = signal(false);
  readonly patient  = signal<Patient | null>(null);
  readonly history  = signal<ClinicalRecord[]>([]);
  readonly fileList = signal<PatientFile[]>([]);

  // in-memory odontogram state (NFR04) — single payload on save
  readonly odontogram = signal<Odontogram>({});
  readonly note = signal('');

  ngOnInit() {
    this.patientId = this.route.snapshot.paramMap.get('id')!;
    this.patients.getById(this.patientId).subscribe({
      next: p => this.patient.set(p),
      error: () => this.snackBar.open('Paciente não encontrado.', 'Fechar', { duration: 3000 }),
    });
    this.loadHistory(true);
    this.loadFiles();
  }

  private loadHistory(initOdontogram = false) {
    this.records.listRecords(this.patientId).subscribe({
      next: list => {
        this.history.set(list);
        if (initOdontogram) {
          this.odontogram.set(list.length ? structuredClone(list[0].odontogramData) : {});
        }
        this.loading.set(false);
      },
      error: () => { this.snackBar.open('Erro ao carregar prontuário.', 'Fechar', { duration: 3000 }); this.loading.set(false); },
    });
  }

  age(): number | null {
    const dob = this.patient()?.dateOfBirth;
    if (!dob) return null;
    const d = new Date(dob);
    const diff = Date.now() - d.getTime();
    return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  }

  toothCount(): number {
    return Object.keys(this.odontogram()).length;
  }

  save() {
    if (this.saving()) return;
    this.saving.set(true);
    this.records.createRecord(this.patientId, {
      odontogramData: this.odontogram(),
      clinicalNotes: this.note().trim() || null,
    }).subscribe({
      next: () => {
        this.snackBar.open('Evolução salva.', '', { duration: 3000 });
        this.note.set('');
        this.saving.set(false);
        this.loadHistory(false);
      },
      error: (err: HttpErrorResponse) => {
        const api = err.error as ApiError;
        this.snackBar.open(api?.message ?? 'Erro ao salvar evolução.', 'Fechar', { duration: 4000 });
        this.saving.set(false);
      },
    });
  }

  /* ---- Radiographs / files ---- */
  private loadFiles() {
    this.files.list(this.patientId).subscribe({
      next: list => this.fileList.set(list),
      error: () => {},
    });
  }

  isImage(f: PatientFile): boolean {
    return (f.contentType ?? '').startsWith('image/');
  }

  onPickFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (!files.length) return;

    this.uploading.set(true);
    forkJoin(files.map(f => this.files.upload(this.patientId, f))).subscribe({
      next: () => {
        this.snackBar.open(files.length > 1 ? 'Arquivos enviados.' : 'Arquivo enviado.', '', { duration: 3000 });
        this.uploading.set(false);
        this.loadFiles();
      },
      error: () => {
        this.snackBar.open('Erro ao enviar arquivo.', 'Fechar', { duration: 4000 });
        this.uploading.set(false);
      },
    });
    input.value = '';
  }

  removeFile(f: PatientFile) {
    if (!confirm(`Remover "${f.fileName}"?`)) return;
    this.files.delete(this.patientId, f.id).subscribe({
      next: () => {
        this.fileList.update(list => list.filter(x => x.id !== f.id));
        this.snackBar.open('Arquivo removido.', '', { duration: 3000 });
      },
      error: () => this.snackBar.open('Erro ao remover arquivo.', 'Fechar', { duration: 3000 }),
    });
  }
}
