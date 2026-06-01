import { Component, model, computed } from '@angular/core';
import { ToothComponent } from './tooth';
import {
  Odontogram, TOOTH_STATUSES, STATUS_CYCLE, statusFromState,
  UPPER_RIGHT, UPPER_LEFT, LOWER_RIGHT, LOWER_LEFT,
} from '../../../core/models/odontogram.model';

@Component({
  selector: 'app-odontogram',
  standalone: true,
  imports: [ToothComponent],
  templateUrl: './odontogram.html',
})
export class OdontogramComponent {
  data = model.required<Odontogram>();

  readonly statuses = TOOTH_STATUSES;
  readonly upperRight = UPPER_RIGHT;
  readonly upperLeft  = UPPER_LEFT;
  readonly lowerRight = LOWER_RIGHT;
  readonly lowerLeft  = LOWER_LEFT;

  /** live counts per status across all 32 teeth */
  readonly counts = computed(() => {
    const all = [...UPPER_RIGHT, ...UPPER_LEFT, ...LOWER_RIGHT, ...LOWER_LEFT];
    const c: Record<string, number> = { healthy: 0, caries: 0, restored: 0, missing: 0, implant: 0 };
    const map = this.data();
    for (const id of all) c[statusFromState(map[id])]++;
    return c;
  });

  statusOf(toothId: string): string {
    return statusFromState(this.data()[toothId]);
  }

  cycle(toothId: string) {
    const cur = this.statusOf(toothId);
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(cur) + 1) % STATUS_CYCLE.length];
    const map: Odontogram = { ...this.data() };
    if (next === 'healthy') delete map[toothId];
    else map[toothId] = { condition: next.toUpperCase(), surfaces: [] };
    this.data.set(map);
  }
}
