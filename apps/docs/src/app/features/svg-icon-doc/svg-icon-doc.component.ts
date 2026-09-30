import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { IconsService, SvgIcon } from '@libs/ui/svg-icon';
import { switchMap } from 'rxjs';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-svg-icon',
  imports: [FormsModule, SvgIcon, PlaygroundComponent, CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './svg-icon-doc.component.html',
})
export class SvgIconDocComponent {
  private readonly _icons = inject(IconsService);

  readonly namespaces = this._icons.namespaces();
  readonly namespace = signal(this.namespaces[0] ?? '');
  readonly search = signal('');

  /** Every icon in the selected namespace, loaded from the registered sets. */
  readonly iconNames = toSignal(
    toObservable(this.namespace).pipe(switchMap((namespace) => this._icons.list(namespace))),
    { initialValue: [] as string[] }
  );
  readonly filteredIconNames = computed(() => {
    const query = this.search().trim().toLowerCase();
    return query ? this.iconNames().filter((name) => name.includes(query)) : this.iconNames();
  });

  readonly sizes = ['3', '4', '5', '6', '8', '10', '12', '16'];
  readonly colors = ['text-foreground', 'text-primary', 'text-error', 'text-muted-foreground'];

  readonly iconName = signal('home');
  readonly size = signal('8');
  readonly color = signal('text-foreground');

  readonly fullName = computed(() => `${this.namespace()}:${this.iconName()}`);
  readonly iconClass = computed(() => `icon-size-${this.size()} ${this.color()}`);

  readonly generatedCode = computed(
    () => `<svg-icon\n  class="${this.iconClass()}"\n  name="${this.fullName()}"\n/>`
  );

  readonly setupCode = `// app.config.ts
import { provideIcons } from '@libs/ui/svg-icon';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIcons([
      { name: 'heroicons_outline', url: 'icons/heroicons-outline.svg' },
      { name: 'heroicons_solid', url: 'icons/heroicons-solid.svg' },
    ]),
  ],
};

// my.component.ts
import { SvgIcon } from '@libs/ui/svg-icon';

@Component({
  imports: [SvgIcon],
  template: '<svg-icon name="heroicons_outline:home" />',
})
export class MyComponent {}`;
}
