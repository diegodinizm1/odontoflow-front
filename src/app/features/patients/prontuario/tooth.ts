import { Component, input, output, computed } from '@angular/core';
import { ToothState, CONDITION_BY_CODE } from '../../../core/models/odontogram.model';

@Component({
  selector: 'app-tooth',
  standalone: true,
  template: `
    <div class="tooth">
      <span class="tooth-num">{{ toothId() }}</span>
      <svg viewBox="0 0 44 44" class="tooth-svg">
        <polygon points="0,0 44,0 31,13 13,13"   [attr.fill]="fillOf('V')" [attr.fill-opacity]="op()" (click)="surface.emit('V')" />
        <polygon points="44,0 44,44 31,31 31,13" [attr.fill]="fillOf('D')" [attr.fill-opacity]="op()" (click)="surface.emit('D')" />
        <polygon points="0,44 44,44 31,31 13,31" [attr.fill]="fillOf('L')" [attr.fill-opacity]="op()" (click)="surface.emit('L')" />
        <polygon points="0,0 0,44 13,31 13,13"   [attr.fill]="fillOf('M')" [attr.fill-opacity]="op()" (click)="surface.emit('M')" />
        <rect x="13" y="13" width="18" height="18" [attr.fill]="fillOf('O')" [attr.fill-opacity]="op()" (click)="surface.emit('O')" />
        @if (marker()) {
          <text x="22" y="26" text-anchor="middle" class="tooth-marker" [attr.fill]="markerColor()">{{ marker() }}</text>
        }
        @if (extracted()) {
          <line x1="5" y1="5" x2="39" y2="39" class="tooth-x" />
          <line x1="39" y1="5" x2="5" y2="39" class="tooth-x" />
        }
      </svg>
    </div>
  `,
})
export class ToothComponent {
  toothId = input.required<string>();
  state   = input<ToothState | undefined>();
  surface = output<string>();

  private def = computed(() => {
    const s = this.state();
    return s ? CONDITION_BY_CODE[s.condition] : undefined;
  });

  readonly extracted = computed(() => this.state()?.condition === 'EXTRACTED');
  readonly marker    = computed(() => this.def()?.marker ?? '');
  readonly markerColor = computed(() => this.def()?.color ?? '#000');

  /** whole-tooth conditions render as a light tint over every zone */
  op() { return this.def()?.whole ? 0.32 : 1; }

  fillOf(surfaceCode: string): string {
    const s = this.state();
    if (!s) return '#ffffff';
    const def = this.def();
    if (!def) return '#ffffff';
    if (def.whole) return def.code === 'EXTRACTED' ? '#E5E7EB' : def.color;
    return s.surfaces.includes(surfaceCode) ? def.color : '#ffffff';
  }
}
