import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Invoice, PlanInfo, Subscription } from '../models/billing.model';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/billing`;

  plans()        { return this.http.get<PlanInfo[]>(`${this.base}/plans`); }
  subscription() { return this.http.get<Subscription>(`${this.base}/subscription`); }
  invoices()     { return this.http.get<Invoice[]>(`${this.base}/invoices`); }
  subscribe(plan: string) { return this.http.post<Subscription>(`${this.base}/subscribe`, { plan }); }
  cancel()       { return this.http.post<Subscription>(`${this.base}/cancel`, {}); }
}
