import {
  Directive,
  ElementRef,
  afterEveryRender,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { UiTableStore } from './table.store';
import { UiTableAlign } from './table.types';

/**
 * Cell options: fixed (sticky) left/right, alignment, ellipsis, width. Also matches the feature
 * cells so `[left]`/`[right]` work on them, and so sort + filter on one `th` match it only once.
 */
@Directive({
  selector:
    'th[uiTableCell], td[uiTableCell], th[uiTableSort], th[uiTableFilter], th[uiTableSelectAll], td[uiTableSelect]',
  exportAs: 'uiTableCell',
  host: {
    '[class.data-table-cell-fix-left]': 'left()',
    '[class.data-table-cell-fix-right]': 'right()',
    '[class.data-table-cell-ellipsis]': 'ellipsis()',
    '[style.left]': 'leftOffset()',
    '[style.right]': 'rightOffset()',
    '[style.text-align]': 'align()',
    '[style.width]': 'width()',
    '[attr.data-fix-edge]': 'fixEdge()',
  },
})
export class UiTableCell {
  private readonly store = inject(UiTableStore);
  private readonly el = inject<ElementRef<HTMLTableCellElement>>(ElementRef).nativeElement;

  readonly left = input(false, { transform: booleanAttribute });
  readonly right = input(false, { transform: booleanAttribute });
  readonly align = input<UiTableAlign | null>(null);
  readonly ellipsis = input(false, { transform: booleanAttribute });
  readonly width = input<string | null>(null);

  private readonly index = signal(-1);

  protected readonly leftOffset = computed(() =>
    this.left() && this.index() >= 0 ? this.store.leftOffset(this.index()) : null
  );

  protected readonly rightOffset = computed(() =>
    this.right() && this.index() >= 0 ? this.store.rightOffset(this.index()) : null
  );

  protected readonly fixEdge = computed(() => {
    const index = this.index();
    const layout = this.store.layout();
    if (this.left() && index === layout.leftEdge) return 'left';
    if (this.right() && index === layout.rightEdge) return 'right';
    return null;
  });

  constructor() {
    // Re-read every render: columns toggled with @if shift the index of cells that stay.
    afterEveryRender({ read: () => this.index.set(this.el.cellIndex) });
  }
}
