import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../core/models/api-error.model';
import { TeamService } from '../../core/services/team.service';

@Component({
  selector: 'app-invite-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './invite-dialog.html',
})
export class InviteDialogComponent {
  private fb       = inject(FormBuilder);
  private team     = inject(TeamService);
  private snackBar = inject(MatSnackBar);
  private ref      = inject(MatDialogRef<InviteDialogComponent>);

  readonly loading = signal(false);
  readonly hidePassword = signal(true);

  form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    role:     ['RECEPTIONIST' as 'DENTIST' | 'RECEPTIONIST', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  save() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.team.invite(this.form.getRawValue()).subscribe({
      next: () => { this.snackBar.open('Membro convidado.', '', { duration: 3000 }); this.ref.close(true); },
      error: (err: HttpErrorResponse) => {
        const api = err.error as ApiError;
        this.snackBar.open(api?.message ?? 'Erro ao convidar membro.', 'Fechar', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }

  close() { this.ref.close(false); }
}
