import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { applyMask, MaskType } from '../utils/mask.util';

/**
 * Formats an input as the user types using a Brazilian mask (cpf, cnpj, cpfCnpj, phone).
 * Works with reactive forms and ngModel — keeps the masked string as the control value.
 *
 * Usage: <input matInput formControlName="document" appMask="cpfCnpj" inputmode="numeric" />
 */
@Directive({
  selector: '[appMask]',
  standalone: true,
})
export class MaskDirective {
  readonly appMask = input.required<MaskType>();

  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private readonly ngControl = inject(NgControl, { optional: true });

  @HostListener('input')
  onInput(): void {
    const masked = applyMask(this.appMask(), this.el.value);
    this.el.value = masked;
    this.ngControl?.control?.setValue(masked, { emitEvent: false });
  }
}
