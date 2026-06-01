import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { InviteUserRequest, TeamMember } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  list()                          { return this.http.get<TeamMember[]>(this.base); }
  invite(req: InviteUserRequest)  { return this.http.post<TeamMember>(this.base, req); }
  remove(id: string)              { return this.http.delete<void>(`${this.base}/${id}`); }
}
