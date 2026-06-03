import { Directive, ElementRef, HostListener, Input, OnDestroy, inject } from '@angular/core';

/** Small hover/focus tooltip rendered in a fixed-position element appended to <body>. */
@Directive({ selector: '[uiTooltip]', standalone: true })
export class TooltipDirective implements OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  @Input('uiTooltip') text = '';

  private tip?: HTMLDivElement;

  @HostListener('mouseenter') @HostListener('focus') show() {
    if (!this.text || this.tip) return;
    const tip = document.createElement('div');
    tip.className = 'ui-tooltip';
    tip.textContent = this.text;
    document.body.appendChild(tip);
    this.tip = tip;

    const r = this.host.nativeElement.getBoundingClientRect();
    tip.style.top = `${r.bottom + 8}px`;
    tip.style.left = `${r.left + r.width / 2}px`;
  }

  @HostListener('mouseleave') @HostListener('blur') @HostListener('click') hide() {
    this.tip?.remove();
    this.tip = undefined;
  }

  ngOnDestroy() { this.hide(); }
}
