import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ApiError } from '../../../core/models/api-error.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
  ],
  templateUrl: './register.html',
})
export class RegisterComponent {
  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private router      = inject(Router);
  private snackBar    = inject(MatSnackBar);

  readonly loading      = signal(false);
  readonly hidePassword = signal(true);

  clinicForm = this.fb.nonNullable.group({
    clinicName: ['', Validators.required],
    document:   ['', Validators.required],
  });

  userForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit() {
    if (this.clinicForm.invalid || this.userForm.invalid || this.loading()) return;

    this.loading.set(true);
    const payload = { ...this.clinicForm.getRawValue(), ...this.userForm.getRawValue() };

    this.authService.registerTenant(payload).subscribe({
      next: () => {
        this.snackBar.open('Clínica cadastrada com sucesso!', '', { duration: 3000 });
        this.router.navigate(['/bem-vindo']);
      },
      error: (err: HttpErrorResponse) => {
        const api = err.error as ApiError;
        this.snackBar.open(api?.message ?? 'Erro ao cadastrar clínica.', 'Fechar', { duration: 5000 });
        this.loading.set(false);
      },
    });
  }
}
