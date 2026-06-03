import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TooltipDirective } from '../../shared/ui/tooltip.directive';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  dentistOnly?: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TooltipDirective],
  templateUrl: './shell.html',
})
export class ShellComponent {
  auth = inject(AuthService);

  private readonly allNavItems: NavItem[] = [
    { label: 'Início',     icon: 'dashboard',         route: '/inicio' },
    { label: 'Agenda',     icon: 'calendar_month',    route: '/agenda' },
    { label: 'Pacientes',  icon: 'groups',            route: '/patients' },
    { label: 'Serviços',   icon: 'medical_services',  route: '/servicos' },
    { label: 'Financeiro', icon: 'payments',          route: '/financeiro',  dentistOnly: true },
    { label: 'Equipe',     icon: 'badge',             route: '/equipe',      dentistOnly: true },
    { label: 'Assinatura', icon: 'workspace_premium', route: '/assinatura',  dentistOnly: true },
  ];

  private readonly isDentist = computed(() => this.auth.currentUser()?.role === 'DENTIST');

  readonly navItems = computed(() =>
    this.allNavItems.filter(item => !item.dentistOnly || this.isDentist()));

  readonly initials = computed(() => {
    const email = this.auth.currentUser()?.email ?? '';
    return email.slice(0, 2).toUpperCase() || '?';
  });
}
