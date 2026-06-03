import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../core/models/api-error.model';
import { TeamService } from '../../core/services/team.service';
import { DialogRef } from '../../shared/ui/dialog/dialog.tokens';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { SelectComponent } from '../../shared/ui/select';
import { SpinnerComponent } from '../../shared/ui/spinner';

@Component({
  selector: 'app-invite-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, SelectComponent, SpinnerComponent],
  templateUrl: './invite-dialog.html',
})
export class InviteDialogComponent {
  private fb       = inject(FormBuilder);
  private team     = inject(TeamService);
  private toast    = inject(ToastService);
  private ref      = inject(DialogRef);

  readonly loading = signal(false);
  readonly hidePassword = signal(true);

  readonly roleOptions = [
    { value: 'DENTIST', label: 'Dentista' },
    { value: 'RECEPTIONIST', label: 'Recepcionista' },
  ];

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
      next: () => { this.toast.open('Membro convidado.'); this.ref.close(true); },
      error: (err: HttpErrorResponse) => {
        const api = err.error as ApiError;
        this.toast.open(api?.message ?? 'Erro ao convidar membro.', 'Fechar', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }

  close() { this.ref.close(false); }
}
