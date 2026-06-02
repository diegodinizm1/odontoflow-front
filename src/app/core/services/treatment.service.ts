import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateTreatmentPlanRequest, TreatmentPlan, TreatmentPlanStatus } from '../models/treatment.model';

@Injectable({ providedIn: 'root' })
export class TreatmentService {
  private http = inject(HttpClient);
  private base(patientId: string) { return `${environment.apiUrl}/patients/${patientId}/treatment-plans`; }

  list(patientId: string) {
    return this.http.get<TreatmentPlan[]>(this.base(patientId));
  }

  create(patientId: string, req: CreateTreatmentPlanRequest) {
    return this.http.post<TreatmentPlan>(this.base(patientId), req);
  }

  updateStatus(patientId: string, planId: string, status: TreatmentPlanStatus) {
    return this.http.patch<TreatmentPlan>(`${this.base(patientId)}/${planId}/status`, { status });
  }

  completeItem(patientId: string, planId: string, itemId: string) {
    return this.http.post<TreatmentPlan>(`${this.base(patientId)}/${planId}/items/${itemId}/complete`, {});
  }
}
