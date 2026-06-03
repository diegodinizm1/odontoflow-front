import {
  Component, Input, Output, EventEmitter, signal, computed, forwardRef, HostListener,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ClickOutsideDirective } from './click-outside.directive';

export interface SelectOption {
  value: any;
  label: string;
}

/**
 * Custom dropdown. Works both with reactive forms (`formControlName`) via
 * ControlValueAccessor and standalone via `[value]` + `(valueChange)`.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [ClickOutsideDirective],
  template: `
    <div class="ui-select" [class.ui-select--open]="open()" [class.ui-select--disabled]="disabled()"
         (uiClickOutside)="close()">
      <button type="button" class="ui-select-trigger" role="combobox"
              [attr.aria-expanded]="open()" [disabled]="disabled()"
              (click)="toggle()" (keydown)="onKeydown($event)">
        <span class="ui-select-value" [class.ui-select-placeholder]="!selectedLabel()">
          {{ selectedLabel() || placeholder }}
        </span>
        <span class="material-symbols-rounded ui-select-arrow">expand_more</span>
      </button>

      @if (open()) {
        <ul class="ui-select-panel" role="listbox">
          @for (opt of options; track opt.value) {
            <li role="option" class="ui-select-option"
                [class.is-selected]="opt.value === value"
                (click)="pick(opt)">{{ opt.label }}</li>
          }
          @if (options.length === 0) {
            <li class="ui-select-option ui-select-empty">Nenhuma opção</li>
          }
        </ul>
      }
    </div>
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Selecione';

  @Input() set value(v: any) { this._value.set(v); }
  get value(): any { return this._value(); }
  private _value = signal<any>(null);

  @Output() valueChange = new EventEmitter<any>();

  readonly open = signal(false);
  readonly disabled = signal(false);

  readonly selectedLabel = computed(() =>
    this.options.find(o => o.value === this._value())?.label ?? '');

  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  toggle() { if (!this.disabled()) this.open.update(o => !o); }
  close() { if (this.open()) { this.open.set(false); this.onTouched(); } }

  pick(opt: SelectOption) {
    this._value.set(opt.value);
    this.onChange(opt.value);
    this.valueChange.emit(opt.value);
    this.close();
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') { this.close(); return; }
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      this.open.set(true);
    }
  }

  @HostListener('document:keydown.escape') onEsc() { this.close(); }

  // ControlValueAccessor
  writeValue(v: any): void { this._value.set(v); }
  registerOnChange(fn: (v: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }
}
