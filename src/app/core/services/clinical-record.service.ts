import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ClinicalRecord, CreateClinicalRecordRequest, Odontogram } from '../models/odontogram.model';

@Injectable({ providedIn: 'root' })
export class ClinicalRecordService {
  private http = inject(HttpClient);
  private base(patientId: string) { return `${environment.apiUrl}/patients/${patientId}`; }

  listRecords(patientId: string) {
    return this.http.get<ClinicalRecord[]>(`${this.base(patientId)}/records`);
  }

  latestOdontogram(patientId: string) {
    return this.http.get<Odontogram>(`${this.base(patientId)}/odontogram`);
  }

  createRecord(patientId: string, req: CreateClinicalRecordRequest) {
    return this.http.post<ClinicalRecord>(`${this.base(patientId)}/records`, req);
  }
}
