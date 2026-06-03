import { Component, signal, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { Patient } from '../../../core/models/patient.model';
import { ClinicalRecord, Odontogram } from '../../../core/models/odontogram.model';
import { PatientFile } from '../../../core/models/patient-file.model';
import { TreatmentPlan, TreatmentItem, TreatmentPlanStatus } from '../../../core/models/treatment.model';
import { ApiError } from '../../../core/models/api-error.model';
import { PatientService } from '../../../core/services/patient.service';
import { ClinicalRecordService } from '../../../core/services/clinical-record.service';
import { PatientFileService } from '../../../core/services/patient-file.service';
import { TreatmentService } from '../../../core/services/treatment.service';
import { OdontogramComponent } from './odontogram';
import { TreatmentPlanDialogComponent } from './treatment-plan-dialog';
import { ChargeDialogComponent } from '../../financial/charge-dialog';
import { DialogService } from '../../../shared/ui/dialog/dialog.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { SpinnerComponent } from '../../../shared/ui/spinner';
import { MenuComponent } from '../../../shared/ui/menu';
import { TooltipDirective } from '../../../shared/ui/tooltip.directive';

@Component({
  selector: 'app-prontuario',
  standalone: true,
  imports: [
    CurrencyPipe, DatePipe, FormsModule, RouterLink, OdontogramComponent,
    SpinnerComponent, MenuComponent, TooltipDirective,
  ],
  templateUrl: './prontuario.html',
})
export class ProntuarioComponent implements OnInit {
  private route    = inject(ActivatedRoute);
  private patients = inject(PatientService);
  private records  = inject(ClinicalRecordService);
  private files    = inject(PatientFileService);
  private treatments = inject(TreatmentService);
  private dialog   = inject(DialogService);
  private toast     = inject(ToastService);

  private patientId = '';

  readonly loading  = signal(true);
  readonly saving   = signal(false);
  readonly uploading = signal(false);
  readonly patient  = signal<Patient | null>(null);
  readonly history  = signal<ClinicalRecord[]>([]);
  readonly fileList = signal<PatientFile[]>([]);
  readonly plans    = signal<TreatmentPlan[]>([]);

  // in-memory odontogram state (NFR04) — single payload on save
  readonly odontogram = signal<Odontogram>({});
  readonly note = signal('');

  ngOnInit() {
    this.patientId = this.route.snapshot.paramMap.get('id')!;
    this.patients.getById(this.patientId).subscribe({
      next: p => this.patient.set(p),
      error: () => this.toast.open('Paciente não encontrado.', 'Fechar'),
    });
    this.loadHistory(true);
    this.loadFiles();
    this.loadPlans();
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
      error: () => { this.toast.open('Erro ao carregar prontuário.', 'Fechar'); this.loading.set(false); },
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
        this.toast.open('Evolução salva.', '');
        this.note.set('');
        this.saving.set(false);
        this.loadHistory(false);
      },
      error: (err: HttpErrorResponse) => {
        const api = err.error as ApiError;
        this.toast.open(api?.message ?? 'Erro ao salvar evolução.', 'Fechar');
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
        this.toast.open(files.length > 1 ? 'Arquivos enviados.' : 'Arquivo enviado.', '');
        this.uploading.set(false);
        this.loadFiles();
      },
      error: () => {
        this.toast.open('Erro ao enviar arquivo.', 'Fechar');
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
        this.toast.open('Arquivo removido.', '');
      },
      error: () => this.toast.open('Erro ao remover arquivo.', 'Fechar'),
    });
  }

  /* ---- Treatment plans ---- */
  private loadPlans() {
    this.treatments.list(this.patientId).subscribe({
      next: list => this.plans.set(list),
      error: () => {},
    });
  }

  openCharge() {
    const p = this.patient();
    if (!p) return;
    this.dialog.open(ChargeDialogComponent, {
      width: '440px',
      data: { patientId: p.id, patientName: p.fullName },
    });
  }

  openCreatePlan() {
    this.dialog.open(TreatmentPlanDialogComponent, { width: '600px', data: { patientId: this.patientId } })
      .afterClosed().subscribe(changed => { if (changed) this.loadPlans(); });
  }

  setPlanStatus(plan: TreatmentPlan, status: TreatmentPlanStatus) {
    this.treatments.updateStatus(this.patientId, plan.id, status).subscribe({
      next: () => this.loadPlans(),
      error: () => this.toast.open('Erro ao atualizar o plano.', 'Fechar'),
    });
  }

  completeItem(plan: TreatmentPlan, item: TreatmentItem) {
    if (item.status === 'DONE') return;
    this.treatments.completeItem(this.patientId, plan.id, item.id).subscribe({
      next: () => {
        this.toast.open('Procedimento concluído — cobrança gerada no Financeiro.', '');
        this.loadPlans();
      },
      error: () => this.toast.open('Erro ao concluir o procedimento.', 'Fechar'),
    });
  }

  planStatusLabel(s: TreatmentPlanStatus): string {
    return { PROPOSED: 'Proposto', ACCEPTED: 'Aceito', COMPLETED: 'Concluído', CANCELED: 'Cancelado' }[s];
  }
}
