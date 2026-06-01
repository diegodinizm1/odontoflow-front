import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatIconModule, MatButtonModule, MatTooltipModule,
  ],
  templateUrl: './shell.html',
})
export class ShellComponent {
  auth = inject(AuthService);

  readonly navItems: NavItem[] = [
    { label: 'Agenda',     icon: 'calendar_month', route: '/agenda' },
    { label: 'Pacientes',  icon: 'groups',         route: '/patients' },
    { label: 'Financeiro', icon: 'payments',          route: '/financeiro' },
    { label: 'Assinatura', icon: 'workspace_premium', route: '/assinatura' },
  ];

  readonly initials = computed(() => {
    const email = this.auth.currentUser()?.email ?? '';
    return email.slice(0, 2).toUpperCase() || '?';
  });
}
