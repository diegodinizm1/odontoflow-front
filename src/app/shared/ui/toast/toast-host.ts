import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

/** Renders active toasts. Mount once at the app root. */
@Component({
  selector: 'app-toast-host',
  standalone: true,
  template: `
    <div class="ui-toast-host">
      @for (t of toasts.toasts(); track t.id) {
        <div class="ui-toast">
          <span class="ui-toast-msg">{{ t.message }}</span>
          @if (t.action) {
            <button type="button" class="ui-toast-action" (click)="toasts.dismiss(t.id)">{{ t.action }}</button>
          }
        </div>
      }
    </div>
  `,
})
export class ToastHostComponent {
  protected toasts = inject(ToastService);
}
