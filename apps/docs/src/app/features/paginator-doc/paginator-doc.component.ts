import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageEvent, Paginator } from '@libs/ui/paginator';
import { ApiRow, ApiTableComponent } from '../../shared/api-table/api-table.component';
import { PlaygroundComponent } from '../../shared/playground/playground.component';

@Component({
  selector: 'doc-paginator',
  imports: [FormsModule, Paginator, PlaygroundComponent, ApiTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './paginator-doc.component.html',
})
export class PaginatorDocComponent {
  readonly length = signal(240);
  readonly pageIndex = signal(1);
  readonly pageSize = signal(10);
  readonly showFirstLastButtons = signal(true);
  readonly hidePageSize = signal(false);
  readonly disabled = signal(false);
  readonly lastEvent = signal<PageEvent | null>(null);

  readonly generatedCode = computed(() => {
    const attrs = [
      `[length]="${this.length()}"`,
      '[pageIndex]="pageIndex"',
      `[pageSize]="${this.pageSize()}"`,
    ];
    if (this.showFirstLastButtons()) attrs.push('showFirstLastButtons');
    if (this.hidePageSize()) attrs.push('hidePageSize');
    if (this.disabled()) attrs.push('disabled');
    attrs.push('(page)="onPage($event)"');
    return `<paginator\n  ${attrs.join('\n  ')}\n/>`;
  });

  readonly apiRows: ApiRow[] = [
    { name: 'length', type: 'number', default: '0', description: 'Total number of items.' },
    { name: 'pageIndex', type: 'number', default: '1', description: 'Current page (1-based).' },
    { name: 'pageSize', type: 'number', default: '10', description: 'Items per page.' },
    {
      name: 'pageSizeOptions',
      type: 'number[]',
      default: '[10, 25, 50, 100]',
      description: 'Choices shown in the page size select.',
    },
    {
      name: 'showFirstLastButtons',
      type: 'boolean',
      default: 'false',
      description: 'Adds first/last page buttons.',
    },
    {
      name: 'hidePageSize',
      type: 'boolean',
      default: 'false',
      description: 'Hides the page size select.',
    },
    {
      name: 'autoHide',
      type: 'boolean',
      default: 'true',
      description: 'Hides the paginator when there are no pages.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disables the page size select.',
    },
    {
      name: '(page)',
      type: 'EventEmitter<PageEvent>',
      description: 'Emits { pageIndex, previousPageIndex, pageSize, length } on every change.',
    },
    {
      name: 'PAGINATOR_DEFAULT_OPTIONS',
      type: 'InjectionToken<PaginatorDefaultOptions>',
      description:
        'App-wide defaults for pageSize, pageSizeOptions, hidePageSize, showFirstLastButtons.',
    },
  ];

  onPage(event: PageEvent): void {
    this.lastEvent.set(event);
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}
