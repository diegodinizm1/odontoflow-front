import {
  ApplicationRef, Component, EnvironmentInjector, HostListener, Injectable, Injector,
  Input, Type, ViewChild, ViewContainerRef, createComponent, inject,
} from '@angular/core';
import { DIALOG_DATA, DialogRef } from './dialog.tokens';

interface DialogConfig { data?: unknown; width?: string; }

/** Backdrop + panel host that renders the dialog component into its view container. */
@Component({
  selector: 'ui-dialog-container',
  standalone: true,
  template: `
    <div class="ui-backdrop" (click)="onBackdrop()"></div>
    <div class="ui-dialog-panel" role="dialog" aria-modal="true" [style.width]="width">
      <ng-container #vc />
    </div>
  `,
})
export class DialogContainerComponent {
  @ViewChild('vc', { read: ViewContainerRef, static: true }) vc!: ViewContainerRef;
  @Input() width?: string;
  dialogRef!: DialogRef;

  onBackdrop() { this.dialogRef.close(); }

  @HostListener('document:keydown.escape') onEsc() { this.dialogRef.close(); }
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  private appRef = inject(ApplicationRef);
  private envInjector = inject(EnvironmentInjector);
  private injector = inject(Injector);

  open<C, R = unknown>(component: Type<C>, config: DialogConfig = {}): DialogRef<R> {
    const ref = new DialogRef<R>();

    const hostEl = document.createElement('div');
    hostEl.className = 'ui-dialog-host';
    document.body.appendChild(hostEl);
    document.body.style.overflow = 'hidden';

    const containerRef = createComponent(DialogContainerComponent, {
      environmentInjector: this.envInjector,
      hostElement: hostEl,
    });
    containerRef.instance.width = config.width;
    containerRef.instance.dialogRef = ref as DialogRef;
    this.appRef.attachView(containerRef.hostView);
    containerRef.changeDetectorRef.detectChanges();

    const contentInjector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: DialogRef, useValue: ref },
        { provide: DIALOG_DATA, useValue: config.data ?? {} },
      ],
    });
    containerRef.instance.vc.createComponent(component, { injector: contentInjector });
    containerRef.changeDetectorRef.detectChanges();

    ref.afterClosed().subscribe(() => {
      this.appRef.detachView(containerRef.hostView);
      containerRef.destroy();
      hostEl.remove();
      document.body.style.overflow = '';
    });

    return ref;
  }
}
