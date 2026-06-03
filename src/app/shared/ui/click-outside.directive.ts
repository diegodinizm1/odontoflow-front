import { Directive, ElementRef, EventEmitter, HostListener, Output, inject } from '@angular/core';

/** Emits when a pointer event happens outside the host element. */
@Directive({ selector: '[uiClickOutside]', standalone: true })
export class ClickOutsideDirective {
  private el = inject(ElementRef<HTMLElement>);
  @Output() uiClickOutside = new EventEmitter<void>();

  @HostListener('document:pointerdown', ['$event'])
  onPointerDown(event: PointerEvent) {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.uiClickOutside.emit();
    }
  }
}
