import { Component, signal, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { ROLE_LABELS } from '../../core/models/auth.model';
import { ApiError } from '../../core/models/api-error.model';
import { SpinnerComponent } from '../../shared/ui/spinner';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerComponent],
  templateUrl: './profile.html',
})
export class ProfileComponent {
  private fb      = inject(FormBuilder);
  private auth    = inject(AuthService);
  private account = inject(AccountService);
  private toast   = inject(ToastService);

  readonly user = computed(() => this.auth.currentUser());
  readonly roleLabel = computed(() => {
    const role = this.user()?.role;
    return role ? ROLE_LABELS[role] : '';
  });

  readonly loading = signal(false);
  readonly hideCurrent = signal(true);
  readonly hideNew = signal(true);

  form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
  });

  save() {
    if (this.form.invalid || this.loading()) return;
    const v = this.form.getRawValue();
    this.loading.set(true);
    this.account.changePassword(v.currentPassword, v.newPassword).subscribe({
      next: () => { this.toast.open('Senha alterada com sucesso.'); this.form.reset(); this.loading.set(false); },
      error: (err: HttpErrorResponse) => {
        const api = err.error as ApiError;
        this.toast.open(api?.message ?? 'Erro ao alterar a senha.', 'Fechar', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }
}
