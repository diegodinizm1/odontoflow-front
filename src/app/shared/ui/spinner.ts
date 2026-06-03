import { Component, Input } from '@angular/core';

/** Lightweight CSS spinner. Inherits color via currentColor (use text-* utilities). */
@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `<span class="ui-spinner"
                   [style.width.px]="size" [style.height.px]="size"
                   [style.borderWidth.px]="border"></span>`,
})
export class SpinnerComponent {
  @Input() size = 38;
  get border(): number { return Math.max(2, Math.round(this.size / 12)); }
}
