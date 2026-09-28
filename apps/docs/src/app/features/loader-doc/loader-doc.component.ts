import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButtonComponent } from '@libs/ui/button';
import { LoaderService } from '@libs/ui/loader';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-loader',
  imports: [FormsModule, UiButtonComponent, PlaygroundComponent, ApiTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loader-doc.component.html',
})
export class LoaderDocComponent {
  private readonly _loader = inject(LoaderService);

  readonly duration = signal(2000);
  readonly loading = signal(false);

  readonly generatedCode = computed(
    () => `private readonly _loader = inject(LoaderService);

save(): void {
  this._loader.show();
  this._api.save().pipe(finalize(() => this._loader.hide())).subscribe();
}`
  );

  readonly apiRows: ApiRow[] = [
    {
      name: 'show()',
      type: '() => LoaderOverlayRef',
      description:
        'Shows a full-screen loader with a backdrop and blocks scrolling. Calling it again reuses the open loader.',
    },
    { name: 'hide()', type: '() => void', description: 'Removes the loader.' },
    {
      name: '--loader_dot_color',
      type: 'CSS custom property',
      default: 'var(--color-primary)',
      description: 'Color of the spinning dots.',
    },
    {
      name: 'provideLoader()',
      type: 'EnvironmentProviders',
      description: 'Optional: eagerly creates LoaderService at bootstrap.',
    },
  ];

  constructor() {
    inject(DestroyRef).onDestroy(() => this._loader.hide());
  }

  show(): void {
    this._loader.show();
    this.loading.set(true);
    setTimeout(() => {
      this._loader.hide();
      this.loading.set(false);
    }, this.duration());
  }
}
