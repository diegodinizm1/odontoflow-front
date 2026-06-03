import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClinicSummary } from '../../core/models/public-booking.model';
import { PublicBookingService } from '../../core/services/public-booking.service';
import { SpinnerComponent } from '../../shared/ui/spinner';

@Component({
  selector: 'app-clinic-directory',
  standalone: true,
  imports: [RouterLink, FormsModule, SpinnerComponent],
  templateUrl: './clinic-directory.html',
})
export class ClinicDirectoryComponent implements OnInit {
  private service = inject(PublicBookingService);

  readonly loading = signal(true);
  readonly clinics = signal<ClinicSummary[]>([]);
  readonly search  = signal('');

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const list = this.clinics();
    return term ? list.filter(c => c.clinicName.toLowerCase().includes(term)) : list;
  });

  ngOnInit() {
    this.service.clinics().subscribe({
      next: list => { this.clinics.set(list); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
