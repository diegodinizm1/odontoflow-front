import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Patient, CreatePatientRequest, UpdatePatientRequest } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/patients`;

  list()                                          { return this.http.get<Patient[]>(this.base); }
  getById(id: string)                             { return this.http.get<Patient>(`${this.base}/${id}`); }
  create(req: CreatePatientRequest)               { return this.http.post<Patient>(this.base, req); }
  update(id: string, req: UpdatePatientRequest)   { return this.http.put<Patient>(`${this.base}/${id}`, req); }
  delete(id: string)                              { return this.http.delete<void>(`${this.base}/${id}`); }
}
