import {
  Component, Input, Output, EventEmitter, signal, computed, forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ClickOutsideDirective } from './click-outside.directive';

interface DayCell { date: Date; inMonth: boolean; disabled: boolean; }

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function startOfDay(d: Date): Date { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function pad(n: number): string { return String(n).padStart(2, '0'); }

/** Custom date picker. Works with reactive forms and `[value]`/`(valueChange)`. Emits a Date. */
@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [ClickOutsideDirective],
  template: `
    <div class="ui-date" (uiClickOutside)="close()">
      <button type="button" class="ui-date-trigger" (click)="toggle()" [disabled]="disabled()">
        <span [class.ui-date-placeholder]="!selected()">{{ display() || placeholder }}</span>
        <span class="material-symbols-rounded ui-date-icon">calendar_month</span>
      </button>

      @if (open()) {
        <div class="ui-cal" role="dialog">
          <div class="ui-cal-head">
            <button type="button" class="ui-cal-nav ui-cal-prev" (click)="prevMonth()" aria-label="Mês anterior">
              <span class="material-symbols-rounded">chevron_left</span>
            </button>
            <span class="ui-cal-title">{{ monthLabel() }}</span>
            <button type="button" class="ui-cal-nav ui-cal-next" (click)="nextMonth()" aria-label="Próximo mês">
              <span class="material-symbols-rounded">chevron_right</span>
            </button>
          </div>
          <div class="ui-cal-grid">
            @for (w of weekdays; track $index) { <span class="ui-cal-dow">{{ w }}</span> }
            @for (cell of cells(); track cell.date.getTime()) {
              <button type="button" class="ui-cal-day"
                      [class.is-outside]="!cell.inMonth"
                      [class.is-selected]="isSelected(cell.date)"
                      [class.is-today]="isToday(cell.date)"
                      [disabled]="cell.disabled"
                      (click)="pick(cell.date)">{{ cell.date.getDate() }}</button>
            }
          </div>
        </div>
      }
    </div>
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatepickerComponent), multi: true },
  ],
})
export class DatepickerComponent implements ControlValueAccessor {
  @Input() placeholder = 'Selecione';
  @Input() min: Date | null = null;

  @Input() set value(v: Date | null) { this.setValue(v); }

  @Output() valueChange = new EventEmitter<Date | null>();

  readonly selected = signal<Date | null>(null);
  readonly weekdays = WEEKDAYS;
  readonly open = signal(false);
  readonly disabled = signal(false);
  readonly viewMonth = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  readonly display = computed(() => {
    const v = this.selected();
    return v ? `${pad(v.getDate())}/${pad(v.getMonth() + 1)}/${v.getFullYear()}` : '';
  });

  readonly monthLabel = computed(() => {
    const m = this.viewMonth();
    return `${MONTHS[m.getMonth()]} de ${m.getFullYear()}`;
  });

  readonly cells = computed<DayCell[]>(() => {
    const m = this.viewMonth();
    const first = new Date(m.getFullYear(), m.getMonth(), 1);
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - first.getDay()); // back to Sunday
    const min = this.min ? startOfDay(this.min) : null;
    const out: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      out.push({
        date,
        inMonth: date.getMonth() === m.getMonth(),
        disabled: !!min && startOfDay(date) < min,
      });
    }
    return out;
  });

  private onChange: (v: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  private setValue(v: Date | null) {
    this.selected.set(v);
    if (v) this.viewMonth.set(new Date(v.getFullYear(), v.getMonth(), 1));
  }

  toggle() { if (!this.disabled()) this.open.update(o => !o); }
  close() { if (this.open()) { this.open.set(false); this.onTouched(); } }
  prevMonth() { const m = this.viewMonth(); this.viewMonth.set(new Date(m.getFullYear(), m.getMonth() - 1, 1)); }
  nextMonth() { const m = this.viewMonth(); this.viewMonth.set(new Date(m.getFullYear(), m.getMonth() + 1, 1)); }

  isSelected(d: Date): boolean {
    const v = this.selected();
    return !!v && startOfDay(v).getTime() === startOfDay(d).getTime();
  }
  isToday(d: Date): boolean { return startOfDay(new Date()).getTime() === startOfDay(d).getTime(); }

  pick(d: Date) {
    const picked = startOfDay(d);
    this.selected.set(picked);
    this.onChange(picked);
    this.valueChange.emit(picked);
    this.close();
  }

  // ControlValueAccessor
  writeValue(v: Date | null): void { this.setValue(v); }
  registerOnChange(fn: (v: Date | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }
}
