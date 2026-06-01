import { Component, model, signal } from '@angular/core';
import { ToothComponent } from './tooth';
import {
  CONDITIONS, CONDITION_BY_CODE, Odontogram, ToothState,
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

  readonly conditions = CONDITIONS;
  readonly selected = signal('CARIES');

  readonly upperRight = UPPER_RIGHT;
  readonly upperLeft  = UPPER_LEFT;
  readonly lowerRight = LOWER_RIGHT;
  readonly lowerLeft  = LOWER_LEFT;

  toothState(id: string): ToothState | undefined {
    return this.data()[id];
  }

  apply(toothId: string, surface: string) {
    const code = this.selected();
    const def = CONDITION_BY_CODE[code];
    const map: Odontogram = { ...this.data() };
    const cur = map[toothId];

    if (code === 'HEALTHY') {
      if (cur) {
        if (CONDITION_BY_CODE[cur.condition]?.whole) {
          delete map[toothId];
        } else {
          const surfaces = cur.surfaces.filter(s => s !== surface);
          if (surfaces.length) map[toothId] = { condition: cur.condition, surfaces };
          else delete map[toothId];
        }
      }
    } else if (def.whole) {
      if (cur && cur.condition === code) delete map[toothId]; // toggle off
      else map[toothId] = { condition: code, surfaces: [] };
    } else {
      const surfaces = cur && cur.condition === code ? [...cur.surfaces] : [];
      const i = surfaces.indexOf(surface);
      if (i >= 0) surfaces.splice(i, 1);
      else surfaces.push(surface);
      if (surfaces.length) map[toothId] = { condition: code, surfaces };
      else delete map[toothId];
    }

    this.data.set(map);
  }
}
