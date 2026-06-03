import { Component, Input, signal, HostListener } from '@angular/core';
import { ClickOutsideDirective } from './click-outside.directive';

/**
 * Dropdown menu with a built-in icon trigger. Project `.ui-menu-item` buttons as content;
 * the panel closes automatically after any click inside it.
 */
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [ClickOutsideDirective],
  template: `
    <div class="ui-menu" (uiClickOutside)="close()">
      <button type="button" class="btn-icon" [attr.aria-expanded]="open()" (click)="toggle()">
        <span class="material-symbols-rounded">{{ icon }}</span>
      </button>
      @if (open()) {
        <div class="ui-menu-panel" [class.ui-menu-panel--right]="align === 'right'" (click)="close()">
          <ng-content />
        </div>
      }
    </div>
  `,
})
export class MenuComponent {
  @Input() icon = 'more_vert';
  @Input() align: 'left' | 'right' = 'right';

  readonly open = signal(false);

  toggle() { this.open.update(o => !o); }
  close() { this.open.set(false); }

  @HostListener('document:keydown.escape') onEsc() { this.close(); }
}
