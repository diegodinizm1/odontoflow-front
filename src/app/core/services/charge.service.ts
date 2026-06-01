import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Charge, ChargeStatus, CreateChargeRequest, FinancialSummary } from '../models/charge.model';

@Injectable({ providedIn: 'root' })
export class ChargeService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/charges`;

  list()                                       { return this.http.get<Charge[]>(this.base); }
  summary()                                    { return this.http.get<FinancialSummary>(`${this.base}/summary`); }
  create(req: CreateChargeRequest)             { return this.http.post<Charge>(this.base, req); }
  updateStatus(id: string, status: ChargeStatus) {
    return this.http.patch<Charge>(`${this.base}/${id}/status`, { status });
  }
}
