import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  Availability, BookingConfirmation, CreateBookingRequest, PublicClinic,
} from '../models/public-booking.model';

@Injectable({ providedIn: 'root' })
export class PublicBookingService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/public/clinics`;

  clinic(slug: string) {
    return this.http.get<PublicClinic>(`${this.base}/${slug}`);
  }

  availability(slug: string, dentistId: string, date: string) {
    const params = new HttpParams().set('dentistId', dentistId).set('date', date);
    return this.http.get<Availability>(`${this.base}/${slug}/availability`, { params });
  }

  book(slug: string, req: CreateBookingRequest) {
    return this.http.post<BookingConfirmation>(`${this.base}/${slug}/bookings`, req);
  }
}
