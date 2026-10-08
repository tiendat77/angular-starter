import { Injectable, signal } from '@angular/core';

/** Whether the navigation drawer is open. It only matters below the `md` breakpoint: from `md` up
 * the sidebar is always visible. Shared by the header (hamburger) and the sidebar. */
@Injectable({ providedIn: 'root' })
export class DocsSidebarState {
  private readonly _open = signal(false);
  readonly open = this._open.asReadonly();

  toggle(): void {
    this._open.update((open) => !open);
  }

  close(): void {
    this._open.set(false);
  }
}
