import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiSize } from '@libs/ui/core';
import {
  UiErrorDirective,
  UiFormFieldAppearance,
  UiFormFieldComponent,
  UiHintDirective,
  UiLabelDirective,
} from '@libs/ui/input';
import {
  UiHighlightDirective,
  UiOptionComponent,
  UiSelectComponent,
  UiSelectEmptyDirective,
} from '@libs/ui/select';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { CodeBlockComponent } from '../../shared/code-block/code-block.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

interface Person {
  id: number;
  name: string;
  email: string;
}

const PEOPLE: Person[] = [
  'Nguyễn Văn An',
  'Trần Thị Bình',
  'Lê Đức Cường',
  'Phạm Minh Dũng',
  'Alice Johnson',
  'Bob Smith',
  'Carol White',
  'David Brown',
  'Emma Wilson',
  'Frank Miller',
  'Grace Lee',
  'Henry Clark',
].map((name, i) => ({
  id: i + 1,
  name,
  email: `${name.split(' ').at(-1)!.toLowerCase()}${i + 1}@example.com`,
}));

@Component({
  selector: 'doc-select',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    UiFormFieldComponent,
    UiLabelDirective,
    UiHintDirective,
    UiErrorDirective,
    UiSelectComponent,
    UiOptionComponent,
    UiHighlightDirective,
    UiSelectEmptyDirective,
    PlaygroundComponent,
    ApiTableComponent,
    CodeBlockComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-doc.component.html',
})
export class SelectDocComponent {
  readonly people = PEOPLE;
  readonly owner = new FormControl<Person | null>(null, Validators.required);

  // Playground controls
  readonly multiple = signal(false);
  readonly searchable = signal(true);
  readonly serverSearch = signal(false);
  readonly allowClear = signal(true);
  readonly disabled = signal(false);
  readonly maxTagCount = signal<number | null>(null);
  readonly size = signal<UiSize>('md');
  readonly appearance = signal<UiFormFieldAppearance>('outline');

  readonly value = signal<Person | Person[] | null>(null);
  readonly loading = signal(false);
  readonly results = signal<Person[]>(PEOPLE);
  private _searchTimer: ReturnType<typeof setTimeout> | undefined;

  readonly byId = (a: Person, b: Person) => a.id === b.id;

  readonly displayValue = computed(() => {
    const value = this.value();
    if (value == null) return 'null';
    return Array.isArray(value) ? `[${value.map((p) => p.name).join(', ')}]` : value.name;
  });

  readonly generatedCode = computed(() => {
    const attrs: string[] = [];
    if (this.multiple()) attrs.push('multiple');
    if (this.searchable()) attrs.push('searchable');
    if (this.serverSearch())
      attrs.push('serverSearch', '[loading]="loading()"', '(search)="query($event)"');
    if (this.allowClear()) attrs.push('allowClear');
    if (this.disabled()) attrs.push('disabled');
    if (this.maxTagCount() != null) attrs.push(`[maxTagCount]="${this.maxTagCount()}"`);
    if (this.size() !== 'md') attrs.push(`size="${this.size()}"`);
    if (this.appearance() !== 'outline') attrs.push(`appearance="${this.appearance()}"`);
    attrs.push('[compareWith]="byId"', '[(value)]="selected"');
    const list = this.serverSearch() ? 'results()' : 'people';
    return `<ui-select\n  ${attrs.join('\n  ')}\n>\n  @for (p of ${list}; track p.id) {\n    <ui-option [value]="p" [label]="p.name" />\n  }\n</ui-select>`;
  });

  readonly formFieldCode = `<ui-form-field>
  <label uiLabel>Owner</label>
  <ui-select [formControl]="owner" [compareWith]="byId" searchable allowClear>
    @for (p of people; track p.id) {
      <ui-option [value]="p" [label]="p.name" />
    }
  </ui-select>
  <span uiHint>Who is responsible for this project.</span>
  @if (owner.invalid && owner.touched) {
    <span uiError>An owner is required.</span>
  }
</ui-form-field>`;

  readonly customCode = `<ui-select searchable [(value)]="owner">
  @for (p of people; track p.id) {
    <ui-option [value]="p" [label]="p.name">
      <span class="flex flex-col">
        <span [uiHighlight]="p.name"></span>
        <span class="text-muted-foreground text-xs">{{ p.email }}</span>
      </span>
    </ui-option>
  }
  <ng-template uiSelectEmpty let-term>No person matches "{{ term }}"</ng-template>
</ui-select>`;

  readonly selectRows: ApiRow[] = [
    {
      name: '[(value)]',
      type: 'T | T[] | null',
      default: 'null',
      description: 'Selected value; an array in multiple mode. Also a form control.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      description: 'Tags + multi selection; the panel stays open after each pick.',
    },
    {
      name: 'searchable',
      type: 'boolean',
      default: 'false',
      description: 'Typing in the trigger filters the options.',
    },
    {
      name: 'filterFn',
      type: '(term, option) => boolean',
      default: 'uiDefaultFilter',
      description: 'Client-side matching. The default is case- and accent-insensitive.',
    },
    {
      name: 'serverSearch',
      type: 'boolean',
      default: 'false',
      description: 'No client filtering; update the options from (search).',
    },
    {
      name: 'searchDebounce',
      type: 'number',
      default: '300',
      description: 'Debounce (ms) for (search).',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Shows a loading row instead of the options.',
    },
    {
      name: 'compareWith',
      type: '(a, b) => boolean',
      default: '===',
      description: 'Value equality, e.g. by id for object values.',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: "''",
      description: 'Shown when there is no value.',
    },
    {
      name: 'allowClear',
      type: 'boolean',
      default: 'false',
      description: 'Shows a clear button when there is a value.',
    },
    {
      name: 'maxTagCount',
      type: 'number | null',
      default: 'null',
      description: 'Extra tags collapse into "+N".',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Also driven by the form control.',
    },
    {
      name: 'size / appearance',
      type: "UiSize / 'outline' | 'filled'",
      default: "'md' / 'outline'",
      description: 'Same scale and look as uiInput.',
    },
    {
      name: '(search)',
      type: 'string',
      description: 'Debounced search term (whenever searchable).',
    },
    { name: '(openedChange)', type: 'boolean', description: 'Panel opened / closed.' },
  ];

  readonly optionRows: ApiRow[] = [
    { name: 'ui-option value', type: 'T (required)', description: 'Option value.' },
    {
      name: 'ui-option label',
      type: 'string (required)',
      description: 'Used for search, highlight, tags and the selected display.',
    },
    {
      name: 'ui-option disabled',
      type: 'boolean',
      default: 'false',
      description: 'Shown but not selectable; skipped by the keyboard.',
    },
    {
      name: '[uiHighlight]',
      type: 'string',
      description:
        'Renders the text with the current search match in <mark>. Optional [uiHighlightTerm].',
    },
    {
      name: 'ng-template uiSelectEmpty',
      type: 'let-term',
      description: 'Custom content when no option matches.',
    },
  ];

  onPlaygroundValue(value: Person | Person[] | null): void {
    this.value.set(value);
  }

  toggleMultiple(multiple: boolean): void {
    this.multiple.set(multiple);
    this.value.set(multiple ? [] : null);
  }

  toggleServerSearch(server: boolean): void {
    this.serverSearch.set(server);
    this.results.set(PEOPLE);
  }

  /** Simulated remote search: 600ms latency, filters by name or email. */
  query(term: string): void {
    clearTimeout(this._searchTimer);
    this.loading.set(true);
    this._searchTimer = setTimeout(() => {
      const needle = term.trim().toLowerCase();
      this.results.set(
        PEOPLE.filter(
          (p) => !needle || p.name.toLowerCase().includes(needle) || p.email.includes(needle)
        )
      );
      this.loading.set(false);
    }, 600);
  }

  setMaxTagCount(value: string): void {
    this.maxTagCount.set(value === '' ? null : Number(value));
  }
}
