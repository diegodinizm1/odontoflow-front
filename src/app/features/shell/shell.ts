import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TooltipDirective } from '../../shared/ui/tooltip.directive';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TooltipDirective],
  templateUrl: './shell.html',
})
export class ShellComponent {
  auth = inject(AuthService);

  readonly navItems: NavItem[] = [
    { label: 'Início',     icon: 'dashboard',         route: '/inicio' },
    { label: 'Agenda',     icon: 'calendar_month',    route: '/agenda' },
    { label: 'Pacientes',  icon: 'groups',            route: '/patients' },
    { label: 'Financeiro', icon: 'payments',          route: '/financeiro' },
    { label: 'Equipe',     icon: 'badge',             route: '/equipe' },
    { label: 'Assinatura', icon: 'workspace_premium', route: '/assinatura' },
  ];

  readonly initials = computed(() => {
    const email = this.auth.currentUser()?.email ?? '';
    return email.slice(0, 2).toUpperCase() || '?';
  });
}
