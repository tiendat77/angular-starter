import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SvgIcon } from '@libs/ui/svg-icon';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

type IconNamespace = 'heroicons_outline' | 'heroicons_solid';

@Component({
  selector: 'doc-svg-icon',
  imports: [FormsModule, SvgIcon, PlaygroundComponent, CodeBlockComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './svg-icon-doc.component.html',
})
export class SvgIconDocComponent {
  readonly iconNames = [
    'home',
    'user',
    'cog-6-tooth',
    'bell',
    'heart',
    'star',
    'magnifying-glass',
    'envelope',
    'calendar',
    'trash',
    'check-circle',
    'x-mark',
    'arrow-right',
    'camera',
    'bars-3',
    'sun',
    'moon',
  ];
  readonly sizes = ['3', '4', '5', '6', '8', '10', '12', '16'];
  readonly colors = ['text-foreground', 'text-primary', 'text-error', 'text-muted-foreground'];

  readonly namespace = signal<IconNamespace>('heroicons_outline');
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
