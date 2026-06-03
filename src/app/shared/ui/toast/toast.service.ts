import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  action?: string;
}

interface ToastConfig { duration?: number; }

/** Minimal toast/snackbar service. Mirrors the old MatSnackBar.open(message, action?, {duration}) call. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;

  open(message: string, action = '', config: ToastConfig = {}): void {
    const id = ++this.seq;
    this.toasts.update(list => [...list, { id, message, action: action || undefined }]);
    const duration = config.duration ?? 3500;
    if (duration > 0) setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
