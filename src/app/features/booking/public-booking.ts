import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { PublicClinic } from '../../core/models/public-booking.model';
import { PublicBookingService } from '../../core/services/public-booking.service';
import { ApiError } from '../../core/models/api-error.model';
import { MaskDirective } from '../../core/directives/mask.directive';
import { dateOnlyIso } from '../../core/utils/datetime.util';

@Component({
  selector: 'app-public-booking',
  standalone: true,
  imports: [
    ReactiveFormsModule, MaskDirective,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './public-booking.html',
})
export class PublicBookingComponent implements OnInit {
  private route    = inject(ActivatedRoute);
  private service  = inject(PublicBookingService);
  private fb       = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  private slug = '';

  readonly today = new Date();
  readonly loadingClinic = signal(true);
  readonly notFound      = signal(false);
  readonly clinic        = signal<PublicClinic | null>(null);

  readonly dentistId     = signal<string | null>(null);
  readonly date          = signal<Date | null>(null);
  readonly loadingSlots  = signal(false);
  readonly slots         = signal<string[]>([]);
  readonly selectedTime  = signal<string | null>(null);

  readonly booking       = signal(false);
  readonly confirmation  = signal<{ dentistName: string; date: string; time: string } | null>(null);

  readonly canPickSlot = computed(() => !!this.dentistId() && !!this.date());
  readonly dentistName = computed(() =>
    this.clinic()?.dentists.find(d => d.id === this.dentistId())?.fullName ?? '');

  contact = this.fb.nonNullable.group({
    patientName:  ['', Validators.required],
    patientPhone: ['', [Validators.required, Validators.minLength(14)]],
  });

  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.service.clinic(this.slug).subscribe({
      next: c => { this.clinic.set(c); this.loadingClinic.set(false); },
      error: () => { this.notFound.set(true); this.loadingClinic.set(false); },
    });
  }

  onDentistChange(id: string) {
    this.dentistId.set(id);
    this.refreshSlots();
  }

  onDateChange(d: Date | null) {
    this.date.set(d);
    this.refreshSlots();
  }

  private refreshSlots() {
    this.selectedTime.set(null);
    this.slots.set([]);
    const dentistId = this.dentistId();
    const date = this.date();
    if (!dentistId || !date) return;

    this.loadingSlots.set(true);
    this.service.availability(this.slug, dentistId, dateOnlyIso(date)).subscribe({
      next: a => { this.slots.set(a.slots); this.loadingSlots.set(false); },
      error: () => { this.slots.set([]); this.loadingSlots.set(false); },
    });
  }

  pickSlot(time: string) { this.selectedTime.set(time); }

  confirm() {
    const time = this.selectedTime();
    const date = this.date();
    const dentistId = this.dentistId();
    if (!time || !date || !dentistId || this.contact.invalid || this.booking()) return;

    const v = this.contact.getRawValue();
    this.booking.set(true);
    this.service.book(this.slug, {
      dentistId, date: dateOnlyIso(date), time,
      patientName: v.patientName, patientPhone: v.patientPhone,
    }).subscribe({
      next: () => {
        this.confirmation.set({ dentistName: this.dentistName(), date: dateOnlyIso(date), time });
        this.booking.set(false);
      },
      error: (err: HttpErrorResponse) => {
        const api = err.error as ApiError;
        this.snackBar.open(api?.message ?? 'Não foi possível agendar. Tente outro horário.', 'Fechar', { duration: 4000 });
        this.booking.set(false);
        this.refreshSlots(); // the slot may have just been taken
      },
    });
  }
}
