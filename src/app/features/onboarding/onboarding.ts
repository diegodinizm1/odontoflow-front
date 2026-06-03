import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PatientService } from '../../core/services/patient.service';
import { TeamService } from '../../core/services/team.service';
import { BillingService } from '../../core/services/billing.service';
import { SpinnerComponent } from '../../shared/ui/spinner';

interface OnboardingStep {
  icon: string;
  title: string;
  description: string;
  cta: string;
  route: string;
  done: boolean;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [RouterLink, SpinnerComponent],
  templateUrl: './onboarding.html',
})
export class OnboardingComponent implements OnInit {
  private patients = inject(PatientService);
  private team     = inject(TeamService);
  private billing  = inject(BillingService);

  readonly loading = signal(true);
  readonly steps   = signal<OnboardingStep[]>([]);

  readonly doneCount = computed(() => this.steps().filter(s => s.done).length);
  readonly allDone   = computed(() => this.steps().length > 0 && this.doneCount() === this.steps().length);

  ngOnInit() {
    forkJoin({
      patients: this.patients.list(),
      team: this.team.list(),
      subscription: this.billing.subscription(),
    }).subscribe({
      next: ({ patients, team, subscription }) => {
        this.steps.set([
          {
            icon: 'person_add', title: 'Cadastre seu primeiro paciente',
            description: 'Comece montando o prontuário e a anamnese do paciente.',
            cta: 'Cadastrar paciente', route: '/patients/new', done: patients.length > 0,
          },
          {
            icon: 'badge', title: 'Convide sua equipe',
            description: 'Adicione dentistas e recepcionistas à sua clínica.',
            cta: 'Convidar membro', route: '/equipe', done: team.length > 1,
          },
          {
            icon: 'workspace_premium', title: 'Escolha seu plano',
            description: 'Conheça os planos e desbloqueie limites maiores.',
            cta: 'Ver planos', route: '/assinatura', done: subscription.plan !== 'FREE',
          },
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
