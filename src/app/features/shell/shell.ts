import { Component, inject, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ROLE_LABELS } from '../../core/models/auth.model';
import { TooltipDirective } from '../../shared/ui/tooltip.directive';
import { ClickOutsideDirective } from '../../shared/ui/click-outside.directive';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  dentistOnly?: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TooltipDirective, ClickOutsideDirective],
  templateUrl: './shell.html',
})
export class ShellComponent {
  auth = inject(AuthService);

  private readonly allNavItems: NavItem[] = [
    { label: 'Início',     icon: 'dashboard',         route: '/inicio' },
    { label: 'Agenda',     icon: 'calendar_month',    route: '/agenda' },
    { label: 'Pacientes',  icon: 'groups',            route: '/patients' },
    { label: 'Serviços',   icon: 'medical_services',  route: '/servicos' },
    { label: 'Cobranças',  icon: 'receipt_long',      route: '/cobrancas' },
    { label: 'Financeiro', icon: 'payments',          route: '/financeiro',  dentistOnly: true },
    { label: 'Equipe',     icon: 'badge',             route: '/equipe',      dentistOnly: true },
    { label: 'Assinatura', icon: 'workspace_premium', route: '/assinatura',  dentistOnly: true },
  ];

  private readonly isDentist = computed(() => this.auth.currentUser()?.role === 'DENTIST');

  readonly navItems = computed(() =>
    this.allNavItems.filter(item => !item.dentistOnly || this.isDentist()));

  readonly userName = computed(() => {
    const u = this.auth.currentUser();
    return u?.name || u?.email || 'Usuário';
  });

  readonly roleLabel = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role ? ROLE_LABELS[role] : '';
  });

  readonly initials = computed(() => {
    const name = this.userName().trim();
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  readonly menuOpen = signal(false);
  toggleMenu() { this.menuOpen.update(o => !o); }
  closeMenu() { this.menuOpen.set(false); }
}
