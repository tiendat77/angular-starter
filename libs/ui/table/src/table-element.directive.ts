import {
  Directive,
  ElementRef,
  Injector,
  OnInit,
  ViewContainerRef,
  afterEveryRender,
  afterNextRender,
  computed,
  inject,
  isDevMode,
} from '@angular/core';
import { UiTableStateBody } from './table-state-body.component';
import { UiTable } from './table.component';
import { UiTableStore } from './table.store';
import { tableVariants } from './table.variants';

/** `'48'` → `'48px'`; any other CSS length is kept as written. */
function normalizeWidth(width: string | null | undefined): string | null {
  const trimmed = width?.trim();
  if (!trimmed) return null;
  return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
}

/** Marks the consumer's `<table>` inside `ui-table`: classes, busy state, state rows, layout. */
@Directive({
  selector: 'table[uiTableElement]',
  host: {
    '[class]': 'classes()',
    '[attr.aria-busy]': 'table.loading() ? "true" : null',
    '[style.min-width]': 'table.scrollX()',
  },
})
export class UiTableElement implements OnInit {
  protected readonly table = inject(UiTable);
  private readonly store = inject(UiTableStore);
  private readonly el = inject<ElementRef<HTMLTableElement>>(ElementRef).nativeElement;
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly warnedColumns = new Set<number>();

  protected readonly classes = computed(() =>
    tableVariants({
      density: this.table.density(),
      bordered: this.table.bordered(),
      striped: this.table.striped(),
    })
  );

  constructor() {
    afterEveryRender({ read: () => this.measure() });
  }

  ngOnInit(): void {
    const stateBody = this.vcr.createComponent(UiTableStateBody);
    afterNextRender(
      { write: () => this.el.appendChild(stateBody.location.nativeElement) },
      { injector: this.injector }
    );
  }

  private measure(): void {
    const headRow = this.el.tHead?.rows[0];
    const cells = headRow ? Array.from(headRow.cells) : [];
    const columnCount = cells.reduce((sum, cell) => sum + cell.colSpan, 0) || 1;
    const cols = Array.from(
      this.el.querySelectorAll<HTMLTableColElement>(':scope > colgroup > col')
    );

    const widths = Array.from({ length: Math.max(cols.length, cells.length) }, (_, i) =>
      normalizeWidth(
        cols[i]?.getAttribute('width') ||
          cols[i]?.style.width ||
          cells[i]?.style.width ||
          cells[i]?.getAttribute('width')
      )
    );

    const leftIndexes = cells.flatMap((cell, i) =>
      cell.classList.contains('data-table-cell-fix-left') ? [i] : []
    );
    const rightIndexes = cells.flatMap((cell, i) =>
      cell.classList.contains('data-table-cell-fix-right') ? [i] : []
    );

    if (isDevMode()) this.warnMissingWidths(widths, leftIndexes, rightIndexes);

    this.store.setLayout({
      columnCount,
      widths,
      leftEdge: leftIndexes.length ? Math.max(...leftIndexes) : -1,
      rightEdge: rightIndexes.length ? Math.min(...rightIndexes) : -1,
    });
  }

  /** A fixed cell's offset is the sum of the widths beside it, so those widths must be declared. */
  private warnMissingWidths(
    widths: readonly (string | null)[],
    leftIndexes: number[],
    rightIndexes: number[]
  ): void {
    const needed = new Set<number>();
    for (const index of leftIndexes) for (let i = 0; i < index; i++) needed.add(i);
    for (const index of rightIndexes) for (let i = index + 1; i < widths.length; i++) needed.add(i);

    for (const index of needed) {
      if (widths[index] || this.warnedColumns.has(index)) continue;
      this.warnedColumns.add(index);
      console.warn(
        `[ui-table] Column ${index} needs a declared width (<col width> or [width]) to position fixed columns.`
      );
    }
  }
}
