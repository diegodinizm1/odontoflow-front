import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.patch<void>(`${environment.apiUrl}/account/password`, { currentPassword, newPassword });
  }
}
