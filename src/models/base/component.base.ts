import { Component, OnDestroy, signal } from '@angular/core';
import { Subject } from 'rxjs';

export type ComponentState = 'loading' | 'loaded' | 'error' | 'empty' | 'not-found' | 'idle';

@Component({
  standalone: true,
  template: '',
  selector: 'app-base-component',
})
export class BaseComponent implements OnDestroy {
  state = signal<ComponentState>('idle');

  protected _destroyed$ = new Subject<void>();

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
