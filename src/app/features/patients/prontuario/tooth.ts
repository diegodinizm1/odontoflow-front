import { Component, input, output, computed } from '@angular/core';
import { STATUS_BY_CODE } from '../../../core/models/odontogram.model';

@Component({
  selector: 'app-tooth',
  standalone: true,
  template: `
    <button type="button" class="tooth-btn group" (click)="toothClick.emit()"
            [title]="'Dente ' + toothId() + ' · ' + def().label">
      <svg width="30" height="38" viewBox="0 0 36 44" class="tooth-svg">
        <path
          d="M6 14 C6 6 12 3 18 3 C24 3 30 6 30 14 C30 20 27 22 26 30 C25 37 24 41 21 41 C19 41 19 33 18 33 C17 33 17 41 15 41 C12 41 11 37 10 30 C9 22 6 20 6 14 Z"
          [attr.fill]="isMissing() ? 'none' : def().fill"
          [attr.stroke]="def().stroke"
          stroke-width="2"
          [attr.stroke-dasharray]="isMissing() ? '3 3' : '0'" />
        @if (status() === 'implant') {
          <circle cx="18" cy="16" r="3.4" fill="none" [attr.stroke]="def().stroke" stroke-width="2" />
        }
        @if (status() === 'caries') {
          <circle cx="18" cy="15" r="2.6" [attr.fill]="def().stroke" />
        }
      </svg>
      <span class="tooth-num" [class.tooth-num-missing]="isMissing()">{{ toothId() }}</span>
    </button>
  `,
})
export class ToothComponent {
  toothId = input.required<string>();
  status  = input<string>('healthy');
  toothClick = output<void>();

  readonly def = computed(() => STATUS_BY_CODE[this.status()] ?? STATUS_BY_CODE['healthy']);
  readonly isMissing = computed(() => this.status() === 'missing');
}
