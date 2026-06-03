import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ApiError } from '../../../core/models/api-error.model';
import { MaskDirective } from '../../../core/directives/mask.directive';
import { SpinnerComponent } from '../../../shared/ui/spinner';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MaskDirective, SpinnerComponent],
  templateUrl: './register.html',
})
export class RegisterComponent {
  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private router      = inject(Router);
  private toast       = inject(ToastService);

  readonly loading      = signal(false);
  readonly hidePassword = signal(true);
  readonly step         = signal(1);

  clinicForm = this.fb.nonNullable.group({
    clinicName: ['', Validators.required],
    document:   ['', Validators.required],
  });

  userForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  next() {
    if (this.clinicForm.invalid) { this.clinicForm.markAllAsTouched(); return; }
    this.step.set(2);
  }

  back() { this.step.set(1); }

  submit() {
    if (this.clinicForm.invalid || this.userForm.invalid || this.loading()) return;

    this.loading.set(true);
    const payload = { ...this.clinicForm.getRawValue(), ...this.userForm.getRawValue() };

    this.authService.registerTenant(payload).subscribe({
      next: () => {
        this.toast.open('Clínica cadastrada com sucesso!');
        this.router.navigate(['/bem-vindo']);
      },
      error: (err: HttpErrorResponse) => {
        const api = err.error as ApiError;
        this.toast.open(api?.message ?? 'Erro ao cadastrar clínica.', 'Fechar', { duration: 5000 });
        this.loading.set(false);
      },
    });
  }
}
