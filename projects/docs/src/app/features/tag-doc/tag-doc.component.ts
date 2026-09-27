import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButtonComponent } from '@libs/ui/button';
import { UiColor } from '@libs/ui/core';
import { UiTagAppearance, UiTagComponent, UiTagSize } from '@libs/ui/tag';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

const INITIAL_FILTERS = ['Design', 'Frontend', 'Urgent', 'Q4'];

@Component({
  selector: 'doc-tag',
  imports: [
    FormsModule,
    UiTagComponent,
    UiButtonComponent,
    PlaygroundComponent,
    ApiTableComponent,
    CodeBlockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tag-doc.component.html',
})
export class TagDocComponent {
  readonly colors: UiColor[] = ['neutral', 'primary', 'info', 'success', 'warning', 'error'];
  readonly appearances: UiTagAppearance[] = ['soft', 'outline', 'solid'];
  readonly sizes: UiTagSize[] = ['sm', 'md', 'lg'];
  readonly statuses = ['Open', 'In progress', 'Done'];

  readonly color = signal<UiColor>('primary');
  readonly appearance = signal<UiTagAppearance>('soft');
  readonly size = signal<UiTagSize>('md');
  readonly removable = signal(false);
  readonly checkable = signal(false);
  readonly disabled = signal(false);
  readonly checked = signal(false);
  readonly removedCount = signal(0);

  readonly filters = signal([...INITIAL_FILTERS]);
  readonly selectedStatuses = signal<ReadonlySet<string>>(new Set(['Open']));

  readonly generatedCode = computed(() => {
    const attrs: string[] = [];
    if (this.color() !== 'neutral') attrs.push(`color="${this.color()}"`);
    if (!this.checkable() && this.appearance() !== 'soft')
      attrs.push(`appearance="${this.appearance()}"`);
    if (this.size() !== 'md') attrs.push(`size="${this.size()}"`);
    if (this.removable()) attrs.push('removable (removed)="remove()"');
    if (this.checkable()) attrs.push('checkable [(checked)]="checked"');
    if (this.disabled()) attrs.push('disabled');
    return `<ui-tag${attrs.length ? ' ' + attrs.join(' ') : ''}>Design</ui-tag>`;
  });

  readonly filtersCode = `@for (f of filters(); track f) {
  <ui-tag removable (removed)="removeFilter(f)">{{ f }}</ui-tag>
}`;

  readonly checkableCode = `@for (s of statuses; track s) {
  <ui-tag checkable color="primary"
          [checked]="selected().has(s)" (checkedChange)="setSelected(s, $event)">
    {{ s }}
  </ui-tag>
}`;

  readonly apiRows: ApiRow[] = [
    { name: 'color', type: 'UiColor', default: "'neutral'", description: 'Semantic color.' },
    {
      name: 'appearance',
      type: "'soft' | 'outline' | 'solid'",
      default: "'soft'",
      description: 'Ignored while checkable: checked is solid, unchecked is outline.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Height 22 / 28 / 32px.',
    },
    { name: 'removable', type: 'boolean', default: 'false', description: 'Shows a × button.' },
    {
      name: 'removeLabel',
      type: 'string',
      default: "'Remove'",
      description: 'The × button is announced as "<removeLabel> <tag text>".',
    },
    {
      name: 'checkable',
      type: 'boolean',
      default: 'false',
      description:
        'Makes the tag a toggle button (aria-pressed). Cannot be combined with removable.',
    },
    { name: 'checked', type: 'model<boolean>', default: 'false', description: 'Checkable state.' },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Blocks remove and toggle.',
    },
    {
      name: '(removed)',
      type: 'void',
      description: 'The tag does not remove itself; drop it from your list.',
    },
    { name: '[uiTagIcon]', type: 'directive', description: 'Leading icon or avatar slot.' },
  ];

  setRemovable(value: boolean): void {
    this.removable.set(value);
    if (value) this.checkable.set(false);
  }

  setCheckable(value: boolean): void {
    this.checkable.set(value);
    if (value) this.removable.set(false);
  }

  onRemoved(): void {
    this.removedCount.update((n) => n + 1);
  }

  removeFilter(filter: string): void {
    this.filters.update((list) => list.filter((f) => f !== filter));
  }

  resetFilters(): void {
    this.filters.set([...INITIAL_FILTERS]);
  }

  setSelected(status: string, checked: boolean): void {
    this.selectedStatuses.update((current) => {
      const next = new Set(current);
      if (checked) next.add(status);
      else next.delete(status);
      return next;
    });
  }
}
