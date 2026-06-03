import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ClinicService, CreateServiceRequest } from '../models/service.model';

@Injectable({ providedIn: 'root' })
export class ServiceCatalogService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/services`;

  list()                                  { return this.http.get<ClinicService[]>(this.base); }
  create(req: CreateServiceRequest)       { return this.http.post<ClinicService>(this.base, req); }
  update(id: string, req: CreateServiceRequest) { return this.http.put<ClinicService>(`${this.base}/${id}`, req); }
  remove(id: string)                      { return this.http.delete<void>(`${this.base}/${id}`); }
}
