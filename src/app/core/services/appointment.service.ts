import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  Appointment, AppointmentStatus,
  CreateAppointmentRequest, RescheduleAppointmentRequest,
} from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/appointments`;

  list(start: string, end: string, dentistId?: string | null) {
    let params = new HttpParams().set('start', start).set('end', end);
    if (dentistId) params = params.set('dentistId', dentistId);
    return this.http.get<Appointment[]>(this.base, { params });
  }

  create(req: CreateAppointmentRequest) {
    return this.http.post<Appointment>(this.base, req);
  }

  reschedule(id: string, req: RescheduleAppointmentRequest) {
    return this.http.put<Appointment>(`${this.base}/${id}`, req);
  }

  updateStatus(id: string, status: AppointmentStatus) {
    return this.http.patch<Appointment>(`${this.base}/${id}/status`, { status });
  }
}
