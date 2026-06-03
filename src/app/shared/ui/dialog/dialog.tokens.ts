import { InjectionToken } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/** Data passed to a dialog component, injected via `inject(DIALOG_DATA)`. */
export const DIALOG_DATA = new InjectionToken<unknown>('DIALOG_DATA');

/** Handle to an open dialog, injected by the dialog component to close it with a result. */
export class DialogRef<R = unknown> {
  private readonly _closed = new Subject<R | undefined>();

  close(result?: R): void {
    this._closed.next(result);
    this._closed.complete();
  }

  afterClosed(): Observable<R | undefined> {
    return this._closed.asObservable();
  }
}
