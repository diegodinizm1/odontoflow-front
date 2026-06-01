import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Appointment } from '../../core/models/appointment.model';
import { AppointmentService } from '../../core/services/appointment.service';
import {
  addDays, dateOnlyIso, decimalHour, sameDay, startOfDayIso, startOfWeek,
} from '../../core/utils/datetime.util';
import { AppointmentDialogComponent, AppointmentDialogData } from './dialog/appointment-dialog';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [
    DatePipe, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './agenda.html',
})
export class AgendaComponent implements OnInit {
  private service  = inject(AppointmentService);
  private dialog   = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  readonly HOUR_START = 8;
  readonly HOUR_END   = 19;
  readonly HOUR_PX    = 60;

  readonly hours = Array.from({ length: this.HOUR_END - this.HOUR_START }, (_, i) => this.HOUR_START + i);

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

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    const start = startOfDayIso(this.weekStart());
    const end = startOfDayIso(addDays(this.weekStart(), 6));
    this.service.list(start, end).subscribe({
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
    };
    this.openDialog(data);
  }

  openEdit(appt: Appointment, event: MouseEvent) {
    event.stopPropagation();
    this.openDialog({ appointment: appt });
  }

  private openDialog(data: AppointmentDialogData) {
    this.dialog.open(AppointmentDialogComponent, { data, width: '460px', autoFocus: false })
      .afterClosed().subscribe(changed => { if (changed) this.load(); });
  }
}
