import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PatientFile, UploadUrlResponse } from '../models/patient-file.model';

@Injectable({ providedIn: 'root' })
export class PatientFileService {
  private http = inject(HttpClient);
  private base(patientId: string) { return `${environment.apiUrl}/patients/${patientId}/files`; }

  list(patientId: string) {
    return this.http.get<PatientFile[]>(this.base(patientId));
  }

  /** Request a pre-signed URL, then PUT the file straight to storage. */
  upload(patientId: string, file: File) {
    return this.http
      .post<UploadUrlResponse>(this.base(patientId), {
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
      })
      .pipe(
        switchMap(res =>
          this.http.put(res.uploadUrl, file, {
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
          }),
        ),
      );
  }

  delete(patientId: string, fileId: string) {
    return this.http.delete<void>(`${this.base(patientId)}/${fileId}`);
  }
}
