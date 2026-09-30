import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  afterNextRender,
  booleanAttribute,
  contentChild,
  effect,
  inject,
  input,
  isDevMode,
  model,
  output,
  viewChild,
} from '@angular/core';
import { PageEvent } from '@libs/ui/paginator';
import { UiSpinnerComponent } from '@libs/ui/progress';
import { UiTableEmpty } from './table-empty.directive';
import { UiTableStore } from './table.store';
import { UiTableDensity, UiTableQueryParams, UiTableSelectionMode } from './table.types';

@Component({
  selector: 'ui-table',
  exportAs: 'uiTable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UiTableStore],
  imports: [UiSpinnerComponent],
  host: {
    class: 'block',
  },
  template: `
    <div class="relative">
      <div
        #container
        class="data-table-container"
        [style.max-height]="scrollY()"
        [attr.data-scroll-y]="scrollY() ? '' : null"
      >
        <ng-content select="table" />
      </div>
      @if (loading() && data().length > 0) {
        <div class="data-table-loading-mask">
          <ui-spinner size="md" />
        </div>
      }
    </div>
    <ng-content />
  `,
})
export class UiTable<T = unknown, K = unknown> implements OnInit {
  // -----------------------------------------------------------------------------------------------------
  // @ Inputs / models / outputs
  // -----------------------------------------------------------------------------------------------------
  readonly data = input<readonly T[]>([]);
  readonly rowKey = input<(row: T) => K>();
  readonly loading = input(false, { transform: booleanAttribute });
  readonly frontPagination = input(true, { transform: booleanAttribute });
  readonly total = input<number>();
  readonly pageIndex = model(1);
  readonly pageSize = model(10);
  readonly pageSizeOptions = input<number[]>([10, 20, 50, 100]);
  readonly selectionMode = input<UiTableSelectionMode>('none');
  readonly selectedKeys = model<ReadonlySet<K>>(new Set<K>());
  readonly density = input<UiTableDensity>('default');
  readonly bordered = input(false, { transform: booleanAttribute });
  readonly striped = input(false, { transform: booleanAttribute });
  /** Max body height (e.g. `'400px'`); turns on the sticky header. */
  readonly scrollY = input<string | null>(null);
  /** Min table width (e.g. `'1000px'`); turns on horizontal scroll. */
  readonly scrollX = input<string | null>(null);

  readonly queryParamsChange = output<UiTableQueryParams>();

  // -----------------------------------------------------------------------------------------------------
  // @ Public state
  // -----------------------------------------------------------------------------------------------------
  readonly store = inject<UiTableStore<T, K>>(UiTableStore);
  readonly viewData = this.store.viewData;
  readonly emptyTemplate = contentChild(UiTableEmpty);

  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');

  constructor() {
    this.store.connect({
      data: this.data,
      rowKey: this.rowKey,
      frontPagination: this.frontPagination,
      total: this.total,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      selectionMode: this.selectionMode,
      selectedKeys: this.selectedKeys,
      onQueryParams: (params) => this.queryParamsChange.emit(params),
    });

    if (isDevMode()) {
      effect(() => {
        const duplicates = this.store.findDuplicateKeys();
        if (duplicates.length) {
          console.warn(`[ui-table] Duplicate row keys: ${duplicates.join(', ')}`);
        }
      });
    }

    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const box = this.container().nativeElement;
      // Written straight to the DOM: shadows are pure CSS and need no change detection.
      const update = () => {
        const max = box.scrollWidth - box.clientWidth;
        box.toggleAttribute('data-scroll-left', box.scrollLeft > 0);
        box.toggleAttribute('data-scroll-right', max > 0 && box.scrollLeft < max - 1);
      };
      update();
      box.addEventListener('scroll', update, { passive: true });
      const resizeObserver =
        typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
      resizeObserver?.observe(box);
      destroyRef.onDestroy(() => {
        box.removeEventListener('scroll', update);
        resizeObserver?.disconnect();
      });
    });
  }

  ngOnInit(): void {
    this.store.assertSelectionConfig();
  }

  protected onPage(event: PageEvent): void {
    const pageSize = Number(event.pageSize);
    if (pageSize !== this.pageSize()) this.store.setPageSize(pageSize);
    else this.store.setPage(event.pageIndex);
  }
}
