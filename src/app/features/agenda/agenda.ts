import { Component, signal, computed, inject, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Appointment } from '../../core/models/appointment.model';
import { TeamMember } from '../../core/models/user.model';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import { TeamService } from '../../core/services/team.service';
import { ApiError } from '../../core/models/api-error.model';
import {
  addDays, dateOnlyIso, dayIndex, decimalHour, formatLocal, parseLocal, sameDay, startOfDayIso, startOfWeek,
} from '../../core/utils/datetime.util';
import { AppointmentDialogComponent, AppointmentDialogData } from './dialog/appointment-dialog';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    DatePipe, DragDropModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule,
    MatFormFieldModule, MatSelectModule,
  ],
  templateUrl: './agenda.html',
})
export class AgendaComponent implements OnInit {
  private service  = inject(AppointmentService);
  private auth     = inject(AuthService);
  private team     = inject(TeamService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Dentists only ever see their own agenda (the API scopes it); receptionists
  // see everyone and can narrow the view to a single dentist.
  readonly isReceptionist = computed(() => this.auth.currentUser()?.role === 'RECEPTIONIST');
  readonly dentists = signal<TeamMember[]>([]);
  readonly selectedDentistId = signal<string | null>(null);

  @ViewChildren('dayColEl') dayCols!: QueryList<ElementRef<HTMLElement>>;

  readonly SNAP_MIN = 15;

  readonly HOUR_START = 8;
  readonly HOUR_END   = 19;
  readonly HOUR_PX    = 60;

  readonly hours = Array.from({ length: this.HOUR_END - this.HOUR_START }, (_, i) => this.HOUR_START + i);

  private suppressClick = false;

  readonly weekStart   = signal(startOfWeek(new Date()));
  readonly loading     = signal(true);
  readonly appointments = signal<Appointment[]>([]);
  readonly today = new Date();

  readonly days = computed(() =>
    Array.from({ length: 6 }, (_, i) => addDays(this.weekStart(), i)));

  readonly weekLabel = computed(() => {
    const s = this.weekStart();
    const e = addDays(s, 5);
    return { start: s, end: e };
  });

  ngOnInit() {
    if (this.isReceptionist()) {
      this.team.list().subscribe(members =>
        this.dentists.set(members.filter(m => m.role === 'DENTIST')));
    }
    this.load();
  }

  onDentistFilterChange(dentistId: string | null) {
    this.selectedDentistId.set(dentistId);
    this.load();
  }

  load() {
    this.loading.set(true);
    const start = startOfDayIso(this.weekStart());
    const end = startOfDayIso(addDays(this.weekStart(), 6));
    this.service.list(start, end, this.selectedDentistId()).subscribe({
      next: data => { this.appointments.set(data); this.loading.set(false); },
      error: () => { this.snackBar.open('Erro ao carregar a agenda.', 'Fechar', { duration: 3000 }); this.loading.set(false); },
    });
  }

  prevWeek() { this.weekStart.set(addDays(this.weekStart(), -7)); this.load(); }
  nextWeek() { this.weekStart.set(addDays(this.weekStart(), 7)); this.load(); }
  goToday()  { this.weekStart.set(startOfWeek(new Date())); this.load(); }

  isToday(day: Date) { return sameDay(day, this.today); }

  appointmentsForDay(day: Date): Appointment[] {
    const iso = dateOnlyIso(day);
    return this.appointments().filter(a => a.startTime.startsWith(iso) && a.status !== 'CANCELED');
  }

  blockStyle(appt: Appointment) {
    const top = (decimalHour(appt.startTime) - this.HOUR_START) * this.HOUR_PX;
    const height = (decimalHour(appt.endTime) - decimalHour(appt.startTime)) * this.HOUR_PX;
    return { top: `${top}px`, height: `${Math.max(height - 4, 22)}px` };
  }

  timeRange(appt: Appointment): string {
    return `${appt.startTime.split('T')[1].slice(0, 5)}–${appt.endTime.split('T')[1].slice(0, 5)}`;
  }

  openCreate(day?: Date, hour?: number) {
    const data: AppointmentDialogData = {
      defaultDate: day ?? new Date(),
      defaultTime: hour != null ? `${String(hour).padStart(2, '0')}:00` : undefined,
      defaultDentistId: this.selectedDentistId() ?? undefined,
    };
    this.openDialog(data);
  }

  openEdit(appt: Appointment, event: MouseEvent) {
    event.stopPropagation();
    if (this.suppressClick) { this.suppressClick = false; return; } // ignore click synthesized by a drag
    this.openDialog({ appointment: appt });
  }

  onDrop(appt: Appointment, event: CdkDragEnd) {
    const colWidth = this.dayCols.first?.nativeElement.offsetWidth ?? 1;
    event.source.reset();

    const deltaDays = Math.round(event.distance.x / colWidth);
    const deltaMin = Math.round((event.distance.y / this.HOUR_PX) * 60 / this.SNAP_MIN) * this.SNAP_MIN;
    if (deltaDays === 0 && deltaMin === 0) return; // a click, not a drag

    // a real drag happened — swallow the click event that follows mouseup
    this.suppressClick = true;
    setTimeout(() => (this.suppressClick = false), 0);

    const start = parseLocal(appt.startTime);
    const durMin = (parseLocal(appt.endTime).getTime() - start.getTime()) / 60000;
    const durHours = durMin / 60;

    // target day, clamped to the visible week
    const origIdx = dayIndex(this.weekStart(), start);
    const targetIdx = Math.max(0, Math.min(5, origIdx + deltaDays));

    // target time, snapped and clamped to working hours
    let dec = decimalHour(appt.startTime) + deltaMin / 60;
    dec = Math.max(this.HOUR_START, Math.min(dec, this.HOUR_END - durHours));
    dec = Math.round(dec * 60 / this.SNAP_MIN) * this.SNAP_MIN / 60;

    const newStart = addDays(this.weekStart(), targetIdx);
    newStart.setHours(Math.floor(dec), Math.round((dec - Math.floor(dec)) * 60), 0, 0);
    const newEnd = new Date(newStart.getTime() + durMin * 60000);

    const startIso = formatLocal(newStart);
    if (startIso === appt.startTime) return; // no effective change

    this.service.reschedule(appt.id, { startTime: startIso, endTime: formatLocal(newEnd) }).subscribe({
      next: () => { this.snackBar.open('Consulta reagendada.', '', { duration: 2500 }); this.load(); },
      error: (err: HttpErrorResponse) => {
        const api = err.error as ApiError;
        this.snackBar.open(api?.message ?? 'Não foi possível reagendar.', 'Fechar', { duration: 4000 });
        this.load();
      },
    });
  }

  private openDialog(data: AppointmentDialogData) {
    this.dialog.open(AppointmentDialogComponent, { data, width: '460px', autoFocus: false })
      .afterClosed().subscribe(changed => { if (changed) this.load(); });
  }
}
