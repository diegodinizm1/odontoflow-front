import { Component, signal, inject, OnInit } from '@angular/core';
import { Role, TeamMember } from '../../core/models/user.model';
import { TeamService } from '../../core/services/team.service';
import { AuthService } from '../../core/services/auth.service';
import { InviteDialogComponent } from './invite-dialog';
import { DialogService } from '../../shared/ui/dialog/dialog.service';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { SpinnerComponent } from '../../shared/ui/spinner';
import { TooltipDirective } from '../../shared/ui/tooltip.directive';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [SpinnerComponent, TooltipDirective],
  templateUrl: './team.html',
})
export class TeamComponent implements OnInit {
  private service  = inject(TeamService);
  private dialog   = inject(DialogService);
  private toast    = inject(ToastService);
  private auth     = inject(AuthService);

  readonly loading = signal(true);
  readonly members = signal<TeamMember[]>([]);
  readonly columns = ['member', 'email', 'role', 'actions'];

  private readonly currentUserId = this.auth.currentUser()?.sub;

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.service.list().subscribe({
      next: data => { this.members.set(data); this.loading.set(false); },
      error: () => { this.toast.open('Erro ao carregar equipe.', 'Fechar'); this.loading.set(false); },
    });
  }

  openInvite() {
    this.dialog.open(InviteDialogComponent, { width: '440px' })
      .afterClosed().subscribe(changed => { if (changed) this.load(); });
  }

  remove(member: TeamMember) {
    if (!confirm(`Remover ${member.fullName} da equipe?`)) return;
    this.service.remove(member.id).subscribe({
      next: () => {
        this.members.update(list => list.filter(m => m.id !== member.id));
        this.toast.open('Membro removido.');
      },
      error: () => this.toast.open('Erro ao remover membro.', 'Fechar'),
    });
  }

  isSelf(member: TeamMember): boolean {
    return member.id === this.currentUserId;
  }

  roleLabel(role: Role): string {
    return role === 'DENTIST' ? 'Dentista' : 'Recepcionista';
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
