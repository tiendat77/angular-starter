import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';

export type ComponentState =
  | 'loading'
  | 'loaded'
  | 'exporting'
  | 'error'
  | 'empty'
  | 'not-found'
  | 'idle';

@Component({
  template: '',
  selector: 'base-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseComponent {
  $state = signal<ComponentState>('idle');

  protected _destroyRef = inject(DestroyRef);
}
