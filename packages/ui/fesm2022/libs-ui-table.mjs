import * as i0 from '@angular/core';
import { signal, computed, Injectable, inject, ElementRef, input, booleanAttribute, afterEveryRender, Directive, TemplateRef, model, output, contentChild, viewChild, isDevMode, effect, DestroyRef, afterNextRender, ChangeDetectionStrategy, Component, InjectionToken, ViewContainerRef, Injector } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Paginator } from '@libs/ui/paginator';
import { UiSpinnerComponent } from '@libs/ui/progress';
import { cva } from '@libs/ui/core';
import * as i2 from '@angular/cdk/a11y';
import { LiveAnnouncer, A11yModule } from '@angular/cdk/a11y';
import * as i1 from '@angular/cdk/overlay';
import { OverlayModule } from '@angular/cdk/overlay';
import { UiButtonComponent } from '@libs/ui/button';
import { UiCheckboxComponent } from '@libs/ui/checkbox';
import { getMenuPositions } from '@libs/ui/menu';

function isEmptyFilterValue(value) {
    return (value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0));
}
function compareDefined(a, b) {
    if (typeof a === 'number' && typeof b === 'number')
        return a - b;
    if (a instanceof Date && b instanceof Date)
        return a.getTime() - b.getTime();
    if (typeof a === 'boolean' && typeof b === 'boolean')
        return Number(a) - Number(b);
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}
/** Default cell comparator. `null`/`undefined` always sort last, whatever the direction. */
function compareValues(a, b, order) {
    const aNil = a === null || a === undefined;
    const bNil = b === null || b === undefined;
    if (aNil || bNil)
        return aNil === bNil ? 0 : aNil ? 1 : -1;
    const result = compareDefined(a, b);
    return order === 'descend' && result !== 0 ? -result : result;
}

function readField(row, key) {
    return row === null || row === undefined ? undefined : row[key];
}
function withEntry(map, key, value) {
    return new Map(map).set(key, value);
}
function withoutEntry(map, key, value) {
    if (map.get(key) !== value)
        return map;
    const next = new Map(map);
    next.delete(key);
    return next;
}
const ROW_KEY_ERROR = '[ui-table] rowKey is required when selectionMode is not "none"';
const EMPTY_LAYOUT = { columnCount: 1, widths: [], leftEdge: -1, rightEdge: -1 };
let nextStoreId = 0;
function sumWidths(widths) {
    const defined = widths.filter((width) => !!width);
    if (defined.length === 0)
        return '0px';
    return defined.length === 1 ? defined[0] : `calc(${defined.join(' + ')})`;
}
function sameLayout(a, b) {
    return (a.columnCount === b.columnCount &&
        a.leftEdge === b.leftEdge &&
        a.rightEdge === b.rightEdge &&
        a.widths.length === b.widths.length &&
        a.widths.every((width, i) => width === b.widths[i]));
}
/**
 * Headless state for `ui-table`: data → filtered → sorted → paged → viewData.
 * `ui-table` provides it and connects its inputs; every table directive injects it.
 */
// Provided by `ui-table` per instance, never in root.
// eslint-disable-next-line @angular-eslint/use-injectable-provided-in
class UiTableStore {
    _sources;
    _sorts = signal(new Map(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_sorts" }] : /* istanbul ignore next */ []));
    _filters = signal(new Map(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_filters" }] : /* istanbul ignore next */ []));
    _selectables = signal(new Set(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_selectables" }] : /* istanbul ignore next */ []));
    _layout = signal(EMPTY_LAYOUT, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_layout" }] : /* istanbul ignore next */ []));
    /** Shared `name` for single-selection radios. */
    radioName = `ui-table-radio-${nextStoreId++}`;
    layout = this._layout.asReadonly();
    // -----------------------------------------------------------------------------------------------------
    // @ Setup
    // -----------------------------------------------------------------------------------------------------
    connect(sources) {
        this._sources = sources;
    }
    get src() {
        if (!this._sources)
            throw new Error('[ui-table] UiTableStore used before connect()');
        return this._sources;
    }
    registerSort(key, registration) {
        this._sorts.update((map) => withEntry(map, key, registration));
        return () => this._sorts.update((map) => withoutEntry(map, key, registration));
    }
    registerFilter(key, registration) {
        this._filters.update((map) => withEntry(map, key, registration));
        return () => this._filters.update((map) => withoutEntry(map, key, registration));
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Pipeline
    // -----------------------------------------------------------------------------------------------------
    activeSort = computed(() => {
        for (const [key, registration] of this._sorts()) {
            const order = registration.sortOrder();
            if (order)
                return { key, order, registration };
        }
        return null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "activeSort" }] : /* istanbul ignore next */ []));
    filtered = computed(() => {
        const data = this.src.data();
        if (!this.src.frontPagination())
            return data;
        const active = [...this._filters().values()].filter((filter) => filter.filterFn() && !isEmptyFilterValue(filter.filterValue()));
        if (active.length === 0)
            return data;
        return data.filter((row) => active.every((filter) => filter.filterFn()(filter.filterValue(), row)));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "filtered" }] : /* istanbul ignore next */ []));
    sorted = computed(() => {
        const rows = this.filtered();
        const active = this.activeSort();
        if (!this.src.frontPagination() || !active)
            return rows;
        const sortFn = active.registration.sortFn();
        if (!sortFn)
            return rows;
        const { key, order } = active;
        const compare = sortFn === true
            ? (a, b) => compareValues(readField(a, key), readField(b, key), order)
            : order === 'descend'
                ? (a, b) => -sortFn(a, b) || 0
                : sortFn;
        return [...rows].sort(compare);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sorted" }] : /* istanbul ignore next */ []));
    total = computed(() => this.src.frontPagination()
        ? this.filtered().length
        : (this.src.total() ?? this.src.data().length), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "total" }] : /* istanbul ignore next */ []));
    lastPage = computed(() => Math.max(1, Math.ceil(this.total() / Math.max(1, this.src.pageSize()))), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "lastPage" }] : /* istanbul ignore next */ []));
    /** The page actually shown. Clamped locally; the `pageIndex` model itself is never rewritten here. */
    currentPage = computed(() => {
        const requested = Math.max(1, this.src.pageIndex());
        return this.src.frontPagination() ? Math.min(requested, this.lastPage()) : requested;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "currentPage" }] : /* istanbul ignore next */ []));
    viewData = computed(() => {
        if (!this.src.frontPagination())
            return this.src.data();
        const size = this.src.pageSize();
        const start = (this.currentPage() - 1) * size;
        return this.sorted().slice(start, start + size);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "viewData" }] : /* istanbul ignore next */ []));
    // -----------------------------------------------------------------------------------------------------
    // @ Actions (each emits exactly one queryParamsChange)
    // -----------------------------------------------------------------------------------------------------
    sort(key) {
        const registration = this._sorts().get(key);
        if (!registration)
            return;
        const directions = registration.sortDirections();
        if (directions.length === 0)
            return;
        const next = directions[(directions.indexOf(registration.sortOrder()) + 1) % directions.length];
        this.setSort(key, next);
    }
    setSort(key, order) {
        for (const [otherKey, registration] of this._sorts()) {
            if (otherKey !== key && registration.sortOrder() !== null)
                registration.sortOrder.set(null);
        }
        this._sorts().get(key)?.sortOrder.set(order);
        this.src.pageIndex.set(1);
        this.emit();
    }
    setFilter(key, value) {
        this._filters().get(key)?.filterValue.set(value);
        this.src.pageIndex.set(1);
        this.emit();
    }
    setPage(pageIndex) {
        this.src.pageIndex.set(pageIndex);
        this.emit();
    }
    setPageSize(pageSize) {
        this.src.pageSize.set(pageSize);
        this.src.pageIndex.set(1);
        this.emit();
    }
    queryParams() {
        const active = this.activeSort();
        return {
            pageIndex: this.currentPage(),
            pageSize: this.src.pageSize(),
            sort: active ? { key: active.key, order: active.order } : null,
            filters: [...this._filters()]
                .filter(([, filter]) => !isEmptyFilterValue(filter.filterValue()))
                .map(([key, filter]) => ({ key, value: filter.filterValue() })),
        };
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Selection
    // -----------------------------------------------------------------------------------------------------
    selectionMode = computed(() => this.src.selectionMode(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectionMode" }] : /* istanbul ignore next */ []));
    selectionEnabled = computed(() => this.selectionMode() !== 'none', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectionEnabled" }] : /* istanbul ignore next */ []));
    keyOf(row) {
        const rowKey = this.src.rowKey();
        if (!rowKey)
            throw new Error(ROW_KEY_ERROR);
        return rowKey(row);
    }
    isSelected(row) {
        return this.selectionEnabled() && this.src.selectedKeys().has(this.keyOf(row));
    }
    registerSelectable(registration) {
        this._selectables.update((set) => new Set(set).add(registration));
        return () => this._selectables.update((set) => {
            const next = new Set(set);
            next.delete(registration);
            return next;
        });
    }
    selectableKeysOnPage = computed(() => {
        if (!this.selectionEnabled())
            return [];
        const disabled = new Set();
        for (const registration of this._selectables()) {
            if (registration.disabled())
                disabled.add(this.keyOf(registration.row()));
        }
        return this.viewData()
            .map((row) => this.keyOf(row))
            .filter((key) => !disabled.has(key));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectableKeysOnPage" }] : /* istanbul ignore next */ []));
    allChecked = computed(() => {
        const keys = this.selectableKeysOnPage();
        const selected = this.src.selectedKeys();
        return keys.length > 0 && keys.every((key) => selected.has(key));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "allChecked" }] : /* istanbul ignore next */ []));
    indeterminate = computed(() => {
        const selected = this.src.selectedKeys();
        return !this.allChecked() && this.selectableKeysOnPage().some((key) => selected.has(key));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "indeterminate" }] : /* istanbul ignore next */ []));
    /** Selected rows found in the current `data` (other pages in server mode are unknown). */
    selectedRows = computed(() => {
        if (!this.selectionEnabled())
            return [];
        const selected = this.src.selectedKeys();
        return this.src.data().filter((row) => selected.has(this.keyOf(row)));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedRows" }] : /* istanbul ignore next */ []));
    toggleRow(row, checked) {
        const key = this.keyOf(row);
        if (this.selectionMode() === 'single') {
            this.src.selectedKeys.set(checked ? new Set([key]) : new Set());
            return;
        }
        const next = new Set(this.src.selectedKeys());
        if (checked)
            next.add(key);
        else
            next.delete(key);
        this.src.selectedKeys.set(next);
    }
    toggleAll() {
        const keys = this.selectableKeysOnPage();
        const next = new Set(this.src.selectedKeys());
        if (this.allChecked())
            keys.forEach((key) => next.delete(key));
        else
            keys.forEach((key) => next.add(key));
        this.src.selectedKeys.set(next);
    }
    assertSelectionConfig() {
        if (this.selectionEnabled() && !this.src.rowKey())
            throw new Error(ROW_KEY_ERROR);
    }
    findDuplicateKeys() {
        const rowKey = this.src.rowKey();
        if (!rowKey)
            return [];
        const seen = new Set();
        const duplicates = new Set();
        for (const row of this.src.data()) {
            const key = rowKey(row);
            if (seen.has(key))
                duplicates.add(key);
            else
                seen.add(key);
        }
        return [...duplicates];
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Layout (fixed columns, column count)
    // -----------------------------------------------------------------------------------------------------
    setLayout(layout) {
        if (!sameLayout(this._layout(), layout))
            this._layout.set(layout);
    }
    /** CSS `left` for a left-fixed cell: the widths of every column before it. */
    leftOffset(index) {
        return sumWidths(this._layout().widths.slice(0, Math.max(0, index)));
    }
    /** CSS `right` for a right-fixed cell: the widths of every column after it. */
    rightOffset(index) {
        return sumWidths(this._layout().widths.slice(index + 1));
    }
    emit() {
        this.src.onQueryParams?.(this.queryParams());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableStore, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableStore });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableStore, decorators: [{
            type: Injectable
        }] });

/**
 * Cell options: fixed (sticky) left/right, alignment, ellipsis, width. Also matches the feature
 * cells so `[left]`/`[right]` work on them, and so sort + filter on one `th` match it only once.
 */
class UiTableCell {
    store = inject(UiTableStore);
    el = inject(ElementRef).nativeElement;
    left = input(false, { ...(ngDevMode ? { debugName: "left" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    right = input(false, { ...(ngDevMode ? { debugName: "right" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    align = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "align" }] : /* istanbul ignore next */ []));
    ellipsis = input(false, { ...(ngDevMode ? { debugName: "ellipsis" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    width = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "width" }] : /* istanbul ignore next */ []));
    index = signal(-1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "index" }] : /* istanbul ignore next */ []));
    leftOffset = computed(() => this.left() && this.index() >= 0 ? this.store.leftOffset(this.index()) : null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "leftOffset" }] : /* istanbul ignore next */ []));
    rightOffset = computed(() => this.right() && this.index() >= 0 ? this.store.rightOffset(this.index()) : null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "rightOffset" }] : /* istanbul ignore next */ []));
    fixEdge = computed(() => {
        const index = this.index();
        const layout = this.store.layout();
        if (this.left() && index === layout.leftEdge)
            return 'left';
        if (this.right() && index === layout.rightEdge)
            return 'right';
        return null;
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "fixEdge" }] : /* istanbul ignore next */ []));
    constructor() {
        // Re-read every render: columns toggled with @if shift the index of cells that stay.
        afterEveryRender({ read: () => this.index.set(this.el.cellIndex) });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableCell, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.0.5", type: UiTableCell, isStandalone: true, selector: "th[uiTableCell], td[uiTableCell], th[uiTableSort], th[uiTableFilter], th[uiTableSelectAll], td[uiTableSelect]", inputs: { left: { classPropertyName: "left", publicName: "left", isSignal: true, isRequired: false, transformFunction: null }, right: { classPropertyName: "right", publicName: "right", isSignal: true, isRequired: false, transformFunction: null }, align: { classPropertyName: "align", publicName: "align", isSignal: true, isRequired: false, transformFunction: null }, ellipsis: { classPropertyName: "ellipsis", publicName: "ellipsis", isSignal: true, isRequired: false, transformFunction: null }, width: { classPropertyName: "width", publicName: "width", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class.data-table-cell-fix-left": "left()", "class.data-table-cell-fix-right": "right()", "class.data-table-cell-ellipsis": "ellipsis()", "style.left": "leftOffset()", "style.right": "rightOffset()", "style.text-align": "align()", "style.width": "width()", "attr.data-fix-edge": "fixEdge()" } }, exportAs: ["uiTableCell"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableCell, decorators: [{
            type: Directive,
            args: [{
                    selector: 'th[uiTableCell], td[uiTableCell], th[uiTableSort], th[uiTableFilter], th[uiTableSelectAll], td[uiTableSelect]',
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
                }]
        }], ctorParameters: () => [], propDecorators: { left: [{ type: i0.Input, args: [{ isSignal: true, alias: "left", required: false }] }], right: [{ type: i0.Input, args: [{ isSignal: true, alias: "right", required: false }] }], align: [{ type: i0.Input, args: [{ isSignal: true, alias: "align", required: false }] }], ellipsis: [{ type: i0.Input, args: [{ isSignal: true, alias: "ellipsis", required: false }] }], width: [{ type: i0.Input, args: [{ isSignal: true, alias: "width", required: false }] }] } });

/** Custom empty state: `<ng-template uiTableEmpty>…</ng-template>` inside `ui-table`. */
class UiTableEmpty {
    templateRef = inject(TemplateRef);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableEmpty, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiTableEmpty, isStandalone: true, selector: "ng-template[uiTableEmpty]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableEmpty, decorators: [{
            type: Directive,
            args: [{ selector: 'ng-template[uiTableEmpty]' }]
        }] });

class UiTable {
    // -----------------------------------------------------------------------------------------------------
    // @ Inputs / models / outputs
    // -----------------------------------------------------------------------------------------------------
    data = input([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "data" }] : /* istanbul ignore next */ []));
    rowKey = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "rowKey" }] : /* istanbul ignore next */ []));
    loading = input(false, { ...(ngDevMode ? { debugName: "loading" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    frontPagination = input(true, { ...(ngDevMode ? { debugName: "frontPagination" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    total = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "total" }] : /* istanbul ignore next */ []));
    pageIndex = model(1, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pageIndex" }] : /* istanbul ignore next */ []));
    pageSize = model(10, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pageSize" }] : /* istanbul ignore next */ []));
    pageSizeOptions = input([10, 20, 50, 100], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "pageSizeOptions" }] : /* istanbul ignore next */ []));
    showPagination = input(true, { ...(ngDevMode ? { debugName: "showPagination" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    selectionMode = input('none', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectionMode" }] : /* istanbul ignore next */ []));
    selectedKeys = model(new Set(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedKeys" }] : /* istanbul ignore next */ []));
    density = input('default', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "density" }] : /* istanbul ignore next */ []));
    bordered = input(false, { ...(ngDevMode ? { debugName: "bordered" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    striped = input(false, { ...(ngDevMode ? { debugName: "striped" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Max body height (e.g. `'400px'`); turns on the sticky header. */
    scrollY = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "scrollY" }] : /* istanbul ignore next */ []));
    /** Min table width (e.g. `'1000px'`); turns on horizontal scroll. */
    scrollX = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "scrollX" }] : /* istanbul ignore next */ []));
    queryParamsChange = output();
    // -----------------------------------------------------------------------------------------------------
    // @ Public state
    // -----------------------------------------------------------------------------------------------------
    store = inject(UiTableStore);
    viewData = this.store.viewData;
    emptyTemplate = contentChild(UiTableEmpty, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emptyTemplate" }] : /* istanbul ignore next */ []));
    container = viewChild.required('container');
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
            const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
            resizeObserver?.observe(box);
            destroyRef.onDestroy(() => {
                box.removeEventListener('scroll', update);
                resizeObserver?.disconnect();
            });
        });
    }
    ngOnInit() {
        this.store.assertSelectionConfig();
    }
    onPage(event) {
        const pageSize = Number(event.pageSize);
        if (pageSize !== this.pageSize())
            this.store.setPageSize(pageSize);
        else
            this.store.setPage(event.pageIndex);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTable, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiTable, isStandalone: true, selector: "ui-table", inputs: { data: { classPropertyName: "data", publicName: "data", isSignal: true, isRequired: false, transformFunction: null }, rowKey: { classPropertyName: "rowKey", publicName: "rowKey", isSignal: true, isRequired: false, transformFunction: null }, loading: { classPropertyName: "loading", publicName: "loading", isSignal: true, isRequired: false, transformFunction: null }, frontPagination: { classPropertyName: "frontPagination", publicName: "frontPagination", isSignal: true, isRequired: false, transformFunction: null }, total: { classPropertyName: "total", publicName: "total", isSignal: true, isRequired: false, transformFunction: null }, pageIndex: { classPropertyName: "pageIndex", publicName: "pageIndex", isSignal: true, isRequired: false, transformFunction: null }, pageSize: { classPropertyName: "pageSize", publicName: "pageSize", isSignal: true, isRequired: false, transformFunction: null }, pageSizeOptions: { classPropertyName: "pageSizeOptions", publicName: "pageSizeOptions", isSignal: true, isRequired: false, transformFunction: null }, showPagination: { classPropertyName: "showPagination", publicName: "showPagination", isSignal: true, isRequired: false, transformFunction: null }, selectionMode: { classPropertyName: "selectionMode", publicName: "selectionMode", isSignal: true, isRequired: false, transformFunction: null }, selectedKeys: { classPropertyName: "selectedKeys", publicName: "selectedKeys", isSignal: true, isRequired: false, transformFunction: null }, density: { classPropertyName: "density", publicName: "density", isSignal: true, isRequired: false, transformFunction: null }, bordered: { classPropertyName: "bordered", publicName: "bordered", isSignal: true, isRequired: false, transformFunction: null }, striped: { classPropertyName: "striped", publicName: "striped", isSignal: true, isRequired: false, transformFunction: null }, scrollY: { classPropertyName: "scrollY", publicName: "scrollY", isSignal: true, isRequired: false, transformFunction: null }, scrollX: { classPropertyName: "scrollX", publicName: "scrollX", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { pageIndex: "pageIndexChange", pageSize: "pageSizeChange", selectedKeys: "selectedKeysChange", queryParamsChange: "queryParamsChange" }, host: { classAttribute: "block" }, providers: [UiTableStore], queries: [{ propertyName: "emptyTemplate", first: true, predicate: UiTableEmpty, descendants: true, isSignal: true }], viewQueries: [{ propertyName: "container", first: true, predicate: ["container"], descendants: true, isSignal: true }], exportAs: ["uiTable"], ngImport: i0, template: `
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
    @if (showPagination()) {
      <paginator
        [length]="store.total()"
        [pageIndex]="store.currentPage()"
        [pageSize]="pageSize()"
        [pageSizeOptions]="pageSizeOptions()"
        [hideTotal]="false"
        (page)="onPage($event)"
      />
    }
  `, isInline: true, dependencies: [{ kind: "component", type: Paginator, selector: "paginator", inputs: ["pageIndex", "length", "pageSize", "pageSizeOptions", "autoHide", "hideTotal", "hidePageSize", "showFirstLastButtons", "disabled"], outputs: ["page"], exportAs: ["paginator"] }, { kind: "component", type: UiSpinnerComponent, selector: "ui-spinner", inputs: ["value", "max", "size", "strokeWidth", "color", "showValue", "label"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTable, decorators: [{
            type: Component,
            args: [{
                    selector: 'ui-table',
                    exportAs: 'uiTable',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [UiTableStore],
                    imports: [Paginator, UiSpinnerComponent],
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
    @if (showPagination()) {
      <paginator
        [length]="store.total()"
        [pageIndex]="store.currentPage()"
        [pageSize]="pageSize()"
        [pageSizeOptions]="pageSizeOptions()"
        [hideTotal]="false"
        (page)="onPage($event)"
      />
    }
  `,
                }]
        }], ctorParameters: () => [], propDecorators: { data: [{ type: i0.Input, args: [{ isSignal: true, alias: "data", required: false }] }], rowKey: [{ type: i0.Input, args: [{ isSignal: true, alias: "rowKey", required: false }] }], loading: [{ type: i0.Input, args: [{ isSignal: true, alias: "loading", required: false }] }], frontPagination: [{ type: i0.Input, args: [{ isSignal: true, alias: "frontPagination", required: false }] }], total: [{ type: i0.Input, args: [{ isSignal: true, alias: "total", required: false }] }], pageIndex: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageIndex", required: false }] }, { type: i0.Output, args: ["pageIndexChange"] }], pageSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageSize", required: false }] }, { type: i0.Output, args: ["pageSizeChange"] }], pageSizeOptions: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageSizeOptions", required: false }] }], showPagination: [{ type: i0.Input, args: [{ isSignal: true, alias: "showPagination", required: false }] }], selectionMode: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectionMode", required: false }] }], selectedKeys: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedKeys", required: false }] }, { type: i0.Output, args: ["selectedKeysChange"] }], density: [{ type: i0.Input, args: [{ isSignal: true, alias: "density", required: false }] }], bordered: [{ type: i0.Input, args: [{ isSignal: true, alias: "bordered", required: false }] }], striped: [{ type: i0.Input, args: [{ isSignal: true, alias: "striped", required: false }] }], scrollY: [{ type: i0.Input, args: [{ isSignal: true, alias: "scrollY", required: false }] }], scrollX: [{ type: i0.Input, args: [{ isSignal: true, alias: "scrollX", required: false }] }], queryParamsChange: [{ type: i0.Output, args: ["queryParamsChange"] }], emptyTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => UiTableEmpty), { isSignal: true }] }], container: [{ type: i0.ViewChild, args: ['container', { isSignal: true }] }] } });

const UI_TABLE_I18N_EN = {
    selectAll: 'Select all rows on this page',
    selectRow: 'Select row',
    filter: (column) => (column ? `Filter ${column}` : 'Filter'),
    filterReset: 'Reset',
    filterConfirm: 'OK',
    empty: 'No data',
    sortedAscending: (column) => `Sorted by ${column}, ascending`,
    sortedDescending: (column) => `Sorted by ${column}, descending`,
    sortCleared: (column) => `Sorting by ${column} cleared`,
};
const UI_TABLE_I18N = new InjectionToken('UI_TABLE_I18N', {
    providedIn: 'root',
    factory: () => UI_TABLE_I18N_EN,
});

/**
 * Skeleton and empty-state rows. Created by `UiTableElement` and moved inside the consumer's
 * `<table>` so the rows share its columns.
 */
class UiTableStateBody {
    table = inject(UiTable);
    store = inject(UiTableStore);
    i18n = inject(UI_TABLE_I18N);
    mode = computed(() => {
        if (this.table.loading())
            return this.table.data().length === 0 ? 'skeleton' : 'none';
        return this.store.viewData().length === 0 ? 'empty' : 'none';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "mode" }] : /* istanbul ignore next */ []));
    skeletonRows = computed(() => Array.from({ length: Math.min(this.table.pageSize(), 10) }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "skeletonRows" }] : /* istanbul ignore next */ []));
    skeletonCells = computed(() => Array.from({ length: this.store.layout().columnCount }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "skeletonCells" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableStateBody, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiTableStateBody, isStandalone: true, selector: "tbody[uiTableStateBody]", host: { classAttribute: "data-table-state-body" }, ngImport: i0, template: `
    @switch (mode()) {
      @case ('skeleton') {
        @for (row of skeletonRows(); track $index) {
          <tr aria-hidden="true">
            @for (cell of skeletonCells(); track $index) {
              <td><span class="data-table-skeleton"></span></td>
            }
          </tr>
        }
      }
      @case ('empty') {
        <tr>
          <td
            class="data-table-empty"
            [attr.colspan]="store.layout().columnCount"
          >
            @if (table.emptyTemplate(); as empty) {
              <ng-container [ngTemplateOutlet]="empty.templateRef" />
            } @else {
              <div class="data-table-empty-default">
                <svg
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  aria-hidden="true"
                >
                  <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
                  <path d="M3 7.5 12 12l9-4.5M12 12v9" />
                </svg>
                <span>{{ i18n.empty }}</span>
              </div>
            }
          </td>
        </tr>
      }
    }
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableStateBody, decorators: [{
            type: Component,
            args: [{
                    // eslint-disable-next-line @angular-eslint/component-selector
                    selector: 'tbody[uiTableStateBody]',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    imports: [NgTemplateOutlet],
                    host: { class: 'data-table-state-body' },
                    template: `
    @switch (mode()) {
      @case ('skeleton') {
        @for (row of skeletonRows(); track $index) {
          <tr aria-hidden="true">
            @for (cell of skeletonCells(); track $index) {
              <td><span class="data-table-skeleton"></span></td>
            }
          </tr>
        }
      }
      @case ('empty') {
        <tr>
          <td
            class="data-table-empty"
            [attr.colspan]="store.layout().columnCount"
          >
            @if (table.emptyTemplate(); as empty) {
              <ng-container [ngTemplateOutlet]="empty.templateRef" />
            } @else {
              <div class="data-table-empty-default">
                <svg
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  aria-hidden="true"
                >
                  <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
                  <path d="M3 7.5 12 12l9-4.5M12 12v9" />
                </svg>
                <span>{{ i18n.empty }}</span>
              </div>
            }
          </td>
        </tr>
      }
    }
  `,
                }]
        }] });

const _tableVariants = cva({
    base: 'data-table',
    variants: {
        density: {
            compact: 'data-table-compact',
            middle: 'data-table-middle',
            default: 'data-table-default',
        },
        bordered: { true: 'data-table-bordered', false: '' },
        striped: { true: 'data-table-striped', false: '' },
    },
    defaultVariants: { density: 'default', bordered: 'false', striped: 'false' },
});
function tableVariants(props, extraClass) {
    return _tableVariants({
        density: props?.density,
        bordered: props?.bordered ? 'true' : 'false',
        striped: props?.striped ? 'true' : 'false',
    }, extraClass);
}

/** `'48'` → `'48px'`; any other CSS length is kept as written. */
function normalizeWidth(width) {
    const trimmed = width?.trim();
    if (!trimmed)
        return null;
    return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
}
/** Marks the consumer's `<table>` inside `ui-table`: classes, busy state, state rows, layout. */
class UiTableElement {
    table = inject(UiTable);
    store = inject(UiTableStore);
    el = inject(ElementRef).nativeElement;
    vcr = inject(ViewContainerRef);
    injector = inject(Injector);
    warnedColumns = new Set();
    classes = computed(() => tableVariants({
        density: this.table.density(),
        bordered: this.table.bordered(),
        striped: this.table.striped(),
    }), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "classes" }] : /* istanbul ignore next */ []));
    constructor() {
        afterEveryRender({ read: () => this.measure() });
    }
    ngOnInit() {
        const stateBody = this.vcr.createComponent(UiTableStateBody);
        afterNextRender({ write: () => this.el.appendChild(stateBody.location.nativeElement) }, { injector: this.injector });
    }
    measure() {
        const headRow = this.el.tHead?.rows[0];
        const cells = headRow ? Array.from(headRow.cells) : [];
        const columnCount = cells.reduce((sum, cell) => sum + cell.colSpan, 0) || 1;
        const cols = Array.from(this.el.querySelectorAll(':scope > colgroup > col'));
        const widths = Array.from({ length: Math.max(cols.length, cells.length) }, (_, i) => normalizeWidth(cols[i]?.getAttribute('width') ||
            cols[i]?.style.width ||
            cells[i]?.style.width ||
            cells[i]?.getAttribute('width')));
        const leftIndexes = cells.flatMap((cell, i) => cell.classList.contains('data-table-cell-fix-left') ? [i] : []);
        const rightIndexes = cells.flatMap((cell, i) => cell.classList.contains('data-table-cell-fix-right') ? [i] : []);
        if (isDevMode())
            this.warnMissingWidths(widths, leftIndexes, rightIndexes);
        this.store.setLayout({
            columnCount,
            widths,
            leftEdge: leftIndexes.length ? Math.max(...leftIndexes) : -1,
            rightEdge: rightIndexes.length ? Math.min(...rightIndexes) : -1,
        });
    }
    /** A fixed cell's offset is the sum of the widths beside it, so those widths must be declared. */
    warnMissingWidths(widths, leftIndexes, rightIndexes) {
        const needed = new Set();
        for (const index of leftIndexes)
            for (let i = 0; i < index; i++)
                needed.add(i);
        for (const index of rightIndexes)
            for (let i = index + 1; i < widths.length; i++)
                needed.add(i);
        for (const index of needed) {
            if (widths[index] || this.warnedColumns.has(index))
                continue;
            this.warnedColumns.add(index);
            console.warn(`[ui-table] Column ${index} needs a declared width (<col width> or [width]) to position fixed columns.`);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableElement, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiTableElement, isStandalone: true, selector: "table[uiTableElement]", host: { properties: { "class": "classes()", "attr.aria-busy": "table.loading() ? \"true\" : null", "style.min-width": "table.scrollX()" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableElement, decorators: [{
            type: Directive,
            args: [{
                    selector: 'table[uiTableElement]',
                    host: {
                        '[class]': 'classes()',
                        '[attr.aria-busy]': 'table.loading() ? "true" : null',
                        '[style.min-width]': 'table.scrollX()',
                    },
                }]
        }], ctorParameters: () => [] });

/** Custom filter UI: `<ng-template uiTableFilterPanel let-ctx>…</ng-template>` inside `th[uiTableFilter]`. */
class UiTableFilterPanel {
    templateRef = inject(TemplateRef);
    static ngTemplateContextGuard(_dir, _ctx) {
        return true;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableFilterPanel, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiTableFilterPanel, isStandalone: true, selector: "ng-template[uiTableFilterPanel]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableFilterPanel, decorators: [{
            type: Directive,
            args: [{ selector: 'ng-template[uiTableFilterPanel]' }]
        }] });

/**
 * Filterable column. Choices are staged in the panel and applied on OK / `confirm()`.
 * Without `filterFn` the column is filtered by the server: the table only emits `queryParamsChange`.
 */
class UiTableFilter {
    store = inject(UiTableStore);
    destroyRef = inject(DestroyRef);
    uiTableFilter = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uiTableFilter" }] : /* istanbul ignore next */ []));
    filters = input([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "filters" }] : /* istanbul ignore next */ []));
    filterMultiple = input(true, { ...(ngDevMode ? { debugName: "filterMultiple" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    filterFn = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "filterFn" }] : /* istanbul ignore next */ []));
    filterValue = model(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "filterValue" }] : /* istanbul ignore next */ []));
    panelTemplate = contentChild(UiTableFilterPanel, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "panelTemplate" }] : /* istanbul ignore next */ []));
    isOpen = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "isOpen" }] : /* istanbul ignore next */ []));
    staged = signal(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "staged" }] : /* istanbul ignore next */ []));
    active = computed(() => !isEmptyFilterValue(this.filterValue()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "active" }] : /* istanbul ignore next */ []));
    panelContext = this.createPanelContext();
    ngOnInit() {
        const unregister = this.store.registerFilter(this.uiTableFilter(), {
            filterFn: this.filterFn,
            filterValue: this.filterValue,
        });
        this.destroyRef.onDestroy(unregister);
    }
    open() {
        const value = this.filterValue();
        this.staged.set(Array.isArray(value) ? [...value] : value);
        this.isOpen.set(true);
    }
    /** Closes without applying staged changes. */
    close() {
        this.isOpen.set(false);
    }
    toggleOpen() {
        if (this.isOpen())
            this.close();
        else
            this.open();
    }
    isStaged(value) {
        const staged = this.staged();
        return this.filterMultiple()
            ? Array.isArray(staged) && staged.includes(value)
            : staged === value;
    }
    stage(value, checked = true) {
        if (!this.filterMultiple()) {
            this.staged.set(checked ? value : null);
            return;
        }
        const current = Array.isArray(this.staged()) ? this.staged() : [];
        const without = current.filter((item) => item !== value);
        this.staged.set(checked ? [...without, value] : without);
    }
    confirm() {
        this.store.setFilter(this.uiTableFilter(), this.staged());
        this.close();
    }
    reset() {
        this.staged.set(null);
        this.store.setFilter(this.uiTableFilter(), null);
        this.close();
    }
    createPanelContext() {
        const context = {
            value: this.staged.asReadonly(),
            setValue: (value) => this.staged.set(value),
            confirm: () => this.confirm(),
            reset: () => this.reset(),
        };
        context.$implicit = context;
        return context;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableFilter, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.2.0", version: "22.0.5", type: UiTableFilter, isStandalone: true, selector: "th[uiTableFilter]", inputs: { uiTableFilter: { classPropertyName: "uiTableFilter", publicName: "uiTableFilter", isSignal: true, isRequired: true, transformFunction: null }, filters: { classPropertyName: "filters", publicName: "filters", isSignal: true, isRequired: false, transformFunction: null }, filterMultiple: { classPropertyName: "filterMultiple", publicName: "filterMultiple", isSignal: true, isRequired: false, transformFunction: null }, filterFn: { classPropertyName: "filterFn", publicName: "filterFn", isSignal: true, isRequired: false, transformFunction: null }, filterValue: { classPropertyName: "filterValue", publicName: "filterValue", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { filterValue: "filterValueChange" }, queries: [{ propertyName: "panelTemplate", first: true, predicate: UiTableFilterPanel, descendants: true, isSignal: true }], exportAs: ["uiTableFilter"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableFilter, decorators: [{
            type: Directive,
            args: [{
                    selector: 'th[uiTableFilter]',
                    exportAs: 'uiTableFilter',
                }]
        }], propDecorators: { uiTableFilter: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTableFilter", required: true }] }], filters: [{ type: i0.Input, args: [{ isSignal: true, alias: "filters", required: false }] }], filterMultiple: [{ type: i0.Input, args: [{ isSignal: true, alias: "filterMultiple", required: false }] }], filterFn: [{ type: i0.Input, args: [{ isSignal: true, alias: "filterFn", required: false }] }], filterValue: [{ type: i0.Input, args: [{ isSignal: true, alias: "filterValue", required: false }] }, { type: i0.Output, args: ["filterValueChange"] }], panelTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => UiTableFilterPanel), { isSignal: true }] }] } });

/**
 * Sortable column. `sortFn: true` uses the default comparator on `row[key]`;
 * `null` (default) means the server sorts: the table only emits `queryParamsChange`.
 */
class UiTableSort {
    store = inject(UiTableStore);
    destroyRef = inject(DestroyRef);
    uiTableSort = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "uiTableSort" }] : /* istanbul ignore next */ []));
    sortFn = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sortFn" }] : /* istanbul ignore next */ []));
    sortDirections = input(['ascend', 'descend', null], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sortDirections" }] : /* istanbul ignore next */ []));
    sortOrder = model(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "sortOrder" }] : /* istanbul ignore next */ []));
    ariaSort = computed(() => {
        const order = this.sortOrder();
        return order === 'ascend' ? 'ascending' : order === 'descend' ? 'descending' : 'none';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ariaSort" }] : /* istanbul ignore next */ []));
    ngOnInit() {
        const unregister = this.store.registerSort(this.uiTableSort(), {
            sortFn: this.sortFn,
            sortDirections: this.sortDirections,
            sortOrder: this.sortOrder,
        });
        this.destroyRef.onDestroy(unregister);
    }
    toggle() {
        this.store.sort(this.uiTableSort());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableSort, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.0.5", type: UiTableSort, isStandalone: true, selector: "th[uiTableSort]", inputs: { uiTableSort: { classPropertyName: "uiTableSort", publicName: "uiTableSort", isSignal: true, isRequired: true, transformFunction: null }, sortFn: { classPropertyName: "sortFn", publicName: "sortFn", isSignal: true, isRequired: false, transformFunction: null }, sortDirections: { classPropertyName: "sortDirections", publicName: "sortDirections", isSignal: true, isRequired: false, transformFunction: null }, sortOrder: { classPropertyName: "sortOrder", publicName: "sortOrder", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { sortOrder: "sortOrderChange" }, host: { properties: { "attr.aria-sort": "ariaSort()" } }, exportAs: ["uiTableSort"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableSort, decorators: [{
            type: Directive,
            args: [{
                    selector: 'th[uiTableSort]',
                    exportAs: 'uiTableSort',
                    host: {
                        '[attr.aria-sort]': 'ariaSort()',
                    },
                }]
        }], propDecorators: { uiTableSort: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiTableSort", required: true }] }], sortFn: [{ type: i0.Input, args: [{ isSignal: true, alias: "sortFn", required: false }] }], sortDirections: [{ type: i0.Input, args: [{ isSignal: true, alias: "sortDirections", required: false }] }], sortOrder: [{ type: i0.Input, args: [{ isSignal: true, alias: "sortOrder", required: false }] }, { type: i0.Output, args: ["sortOrderChange"] }] } });

let nextHeaderCellId = 0;
/**
 * Renders sortable/filterable header content. Sort and filter are directives so both can sit on
 * one `th`; Angular allows only one component per element, so this is the single renderer.
 */
class UiTableHeaderCell {
    sort = inject(UiTableSort, { self: true, optional: true });
    filter = inject(UiTableFilter, { self: true, optional: true });
    i18n = inject(UI_TABLE_I18N);
    announcer = inject(LiveAnnouncer);
    labelEl = viewChild('labelEl', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "labelEl" }] : /* istanbul ignore next */ []));
    positions = getMenuPositions('bottom-end');
    radioName = `ui-table-filter-${nextHeaderCellId++}`;
    /** Plain header text, used for announcements and the filter's accessible name. */
    headerText = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "headerText" }] : /* istanbul ignore next */ []));
    constructor() {
        afterNextRender({
            read: () => this.headerText.set(this.labelEl()?.nativeElement.textContent?.trim() ?? ''),
        });
    }
    onSortClick() {
        if (!this.sort)
            return;
        this.sort.toggle();
        const column = this.headerText();
        const order = this.sort.sortOrder();
        const message = order === 'ascend'
            ? this.i18n.sortedAscending(column)
            : order === 'descend'
                ? this.i18n.sortedDescending(column)
                : this.i18n.sortCleared(column);
        void this.announcer.announce(message);
    }
    onOverlayKeydown(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.filter?.close();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableHeaderCell, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiTableHeaderCell, isStandalone: true, selector: "th[uiTableSort], th[uiTableFilter]", viewQueries: [{ propertyName: "labelEl", first: true, predicate: ["labelEl"], descendants: true, isSignal: true }], ngImport: i0, template: `
    <ng-template #label><ng-content /></ng-template>
    <div class="data-table-header-cell">
      @if (sort) {
        <button
          type="button"
          class="data-table-sort"
          [attr.data-order]="sort.sortOrder()"
          (click)="onSortClick()"
        >
          <span
            #labelEl
            class="data-table-header-label"
            ><ng-container [ngTemplateOutlet]="label"
          /></span>
          <svg
            class="data-table-sort-icon"
            viewBox="0 0 8 12"
            width="8"
            height="12"
            aria-hidden="true"
          >
            <path
              class="data-table-sort-up"
              d="M4 0 8 5H0z"
            />
            <path
              class="data-table-sort-down"
              d="M4 12 0 7h8z"
            />
          </svg>
        </button>
      } @else {
        <span
          #labelEl
          class="data-table-header-label"
          ><ng-container [ngTemplateOutlet]="label"
        /></span>
      }

      @if (filter) {
        <button
          #origin="cdkOverlayOrigin"
          type="button"
          class="data-table-filter-trigger"
          cdkOverlayOrigin
          aria-haspopup="dialog"
          [attr.aria-expanded]="filter.isOpen()"
          [attr.aria-label]="i18n.filter(headerText())"
          [attr.data-active]="filter.active() ? '' : null"
          (click)="filter.toggleOpen()"
        >
          <svg
            viewBox="0 0 16 16"
            width="12"
            height="12"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M1 2h14l-5.5 6.5V14l-3-1.5V8.5z" />
          </svg>
        </button>

        <ng-template
          cdkConnectedOverlay
          cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
          [cdkConnectedOverlayOrigin]="origin"
          [cdkConnectedOverlayOpen]="filter.isOpen()"
          [cdkConnectedOverlayPositions]="positions"
          [cdkConnectedOverlayHasBackdrop]="true"
          (backdropClick)="filter.close()"
          (overlayKeydown)="onOverlayKeydown($event)"
          (detach)="filter.close()"
        >
          <div
            class="data-table-filter-panel"
            role="dialog"
            cdkTrapFocus
            [cdkTrapFocusAutoCapture]="true"
            [attr.aria-label]="i18n.filter(headerText())"
          >
            @if (filter.panelTemplate(); as panel) {
              <div class="p-2">
                <ng-container
                  [ngTemplateOutlet]="panel.templateRef"
                  [ngTemplateOutletContext]="filter.panelContext"
                />
              </div>
            } @else {
              <ul class="data-table-filter-list">
                @for (option of filter.filters(); track $index) {
                  <li>
                    @if (filter.filterMultiple()) {
                      <ui-checkbox
                        size="sm"
                        [label]="option.text"
                        [checked]="filter.isStaged(option.value)"
                        (checkedChange)="filter.stage(option.value, $event)"
                      />
                    } @else {
                      <label class="data-table-filter-option">
                        <input
                          type="radio"
                          class="radio radio-sm"
                          [name]="radioName"
                          [checked]="filter.isStaged(option.value)"
                          (change)="filter.stage(option.value)"
                        />
                        <span>{{ option.text }}</span>
                      </label>
                    }
                  </li>
                }
              </ul>
              <div class="data-table-filter-actions">
                <button
                  uiButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  (click)="filter.reset()"
                >
                  {{ i18n.filterReset }}
                </button>
                <button
                  uiButton
                  type="button"
                  size="sm"
                  (click)="filter.confirm()"
                >
                  {{ i18n.filterConfirm }}
                </button>
              </div>
            }
          </div>
        </ng-template>
      }
    </div>
  `, isInline: true, dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "ngmodule", type: OverlayModule }, { kind: "directive", type: i1.CdkConnectedOverlay, selector: "[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]", inputs: ["cdkConnectedOverlayOrigin", "cdkConnectedOverlayPositions", "cdkConnectedOverlayPositionStrategy", "cdkConnectedOverlayOffsetX", "cdkConnectedOverlayOffsetY", "cdkConnectedOverlayWidth", "cdkConnectedOverlayHeight", "cdkConnectedOverlayMinWidth", "cdkConnectedOverlayMinHeight", "cdkConnectedOverlayBackdropClass", "cdkConnectedOverlayPanelClass", "cdkConnectedOverlayViewportMargin", "cdkConnectedOverlayScrollStrategy", "cdkConnectedOverlayOpen", "cdkConnectedOverlayDisableClose", "cdkConnectedOverlayTransformOriginOn", "cdkConnectedOverlayHasBackdrop", "cdkConnectedOverlayLockPosition", "cdkConnectedOverlayFlexibleDimensions", "cdkConnectedOverlayGrowAfterOpen", "cdkConnectedOverlayPush", "cdkConnectedOverlayDisposeOnNavigation", "cdkConnectedOverlayUsePopover", "cdkConnectedOverlayMatchWidth", "cdkConnectedOverlay"], outputs: ["backdropClick", "positionChange", "attach", "detach", "overlayKeydown", "overlayOutsideClick"], exportAs: ["cdkConnectedOverlay"] }, { kind: "directive", type: i1.CdkOverlayOrigin, selector: "[cdk-overlay-origin], [overlay-origin], [cdkOverlayOrigin]", exportAs: ["cdkOverlayOrigin"] }, { kind: "ngmodule", type: A11yModule }, { kind: "directive", type: i2.CdkTrapFocus, selector: "[cdkTrapFocus]", inputs: ["cdkTrapFocus", "cdkTrapFocusAutoCapture"], exportAs: ["cdkTrapFocus"] }, { kind: "component", type: UiCheckboxComponent, selector: "ui-checkbox", inputs: ["checked", "indeterminate", "disabled", "size", "label", "id", "ariaLabel"], outputs: ["checkedChange"] }, { kind: "component", type: UiButtonComponent, selector: "button[uiButton], a[uiButton]", inputs: ["variant", "size", "loading", "disabled", "fullWidth"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableHeaderCell, decorators: [{
            type: Component,
            args: [{
                    // eslint-disable-next-line @angular-eslint/component-selector
                    selector: 'th[uiTableSort], th[uiTableFilter]',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    imports: [NgTemplateOutlet, OverlayModule, A11yModule, UiCheckboxComponent, UiButtonComponent],
                    template: `
    <ng-template #label><ng-content /></ng-template>
    <div class="data-table-header-cell">
      @if (sort) {
        <button
          type="button"
          class="data-table-sort"
          [attr.data-order]="sort.sortOrder()"
          (click)="onSortClick()"
        >
          <span
            #labelEl
            class="data-table-header-label"
            ><ng-container [ngTemplateOutlet]="label"
          /></span>
          <svg
            class="data-table-sort-icon"
            viewBox="0 0 8 12"
            width="8"
            height="12"
            aria-hidden="true"
          >
            <path
              class="data-table-sort-up"
              d="M4 0 8 5H0z"
            />
            <path
              class="data-table-sort-down"
              d="M4 12 0 7h8z"
            />
          </svg>
        </button>
      } @else {
        <span
          #labelEl
          class="data-table-header-label"
          ><ng-container [ngTemplateOutlet]="label"
        /></span>
      }

      @if (filter) {
        <button
          #origin="cdkOverlayOrigin"
          type="button"
          class="data-table-filter-trigger"
          cdkOverlayOrigin
          aria-haspopup="dialog"
          [attr.aria-expanded]="filter.isOpen()"
          [attr.aria-label]="i18n.filter(headerText())"
          [attr.data-active]="filter.active() ? '' : null"
          (click)="filter.toggleOpen()"
        >
          <svg
            viewBox="0 0 16 16"
            width="12"
            height="12"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M1 2h14l-5.5 6.5V14l-3-1.5V8.5z" />
          </svg>
        </button>

        <ng-template
          cdkConnectedOverlay
          cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
          [cdkConnectedOverlayOrigin]="origin"
          [cdkConnectedOverlayOpen]="filter.isOpen()"
          [cdkConnectedOverlayPositions]="positions"
          [cdkConnectedOverlayHasBackdrop]="true"
          (backdropClick)="filter.close()"
          (overlayKeydown)="onOverlayKeydown($event)"
          (detach)="filter.close()"
        >
          <div
            class="data-table-filter-panel"
            role="dialog"
            cdkTrapFocus
            [cdkTrapFocusAutoCapture]="true"
            [attr.aria-label]="i18n.filter(headerText())"
          >
            @if (filter.panelTemplate(); as panel) {
              <div class="p-2">
                <ng-container
                  [ngTemplateOutlet]="panel.templateRef"
                  [ngTemplateOutletContext]="filter.panelContext"
                />
              </div>
            } @else {
              <ul class="data-table-filter-list">
                @for (option of filter.filters(); track $index) {
                  <li>
                    @if (filter.filterMultiple()) {
                      <ui-checkbox
                        size="sm"
                        [label]="option.text"
                        [checked]="filter.isStaged(option.value)"
                        (checkedChange)="filter.stage(option.value, $event)"
                      />
                    } @else {
                      <label class="data-table-filter-option">
                        <input
                          type="radio"
                          class="radio radio-sm"
                          [name]="radioName"
                          [checked]="filter.isStaged(option.value)"
                          (change)="filter.stage(option.value)"
                        />
                        <span>{{ option.text }}</span>
                      </label>
                    }
                  </li>
                }
              </ul>
              <div class="data-table-filter-actions">
                <button
                  uiButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  (click)="filter.reset()"
                >
                  {{ i18n.filterReset }}
                </button>
                <button
                  uiButton
                  type="button"
                  size="sm"
                  (click)="filter.confirm()"
                >
                  {{ i18n.filterConfirm }}
                </button>
              </div>
            }
          </div>
        </ng-template>
      }
    </div>
  `,
                }]
        }], ctorParameters: () => [], propDecorators: { labelEl: [{ type: i0.ViewChild, args: ['labelEl', { isSignal: true }] }] } });

class UiTableRow {
    store = inject(UiTableStore);
    row = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "row" }] : /* istanbul ignore next */ []));
    selected = computed(() => this.store.isSelected(this.row()), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selected" }] : /* istanbul ignore next */ []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableRow, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.0.5", type: UiTableRow, isStandalone: true, selector: "tr[uiTableRow]", inputs: { row: { classPropertyName: "row", publicName: "row", isSignal: true, isRequired: true, transformFunction: null } }, host: { properties: { "attr.aria-selected": "selected() ? \"true\" : null", "attr.data-selected": "selected() ? \"\" : null" }, classAttribute: "data-table-row" }, exportAs: ["uiTableRow"], ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableRow, decorators: [{
            type: Directive,
            args: [{
                    selector: 'tr[uiTableRow]',
                    exportAs: 'uiTableRow',
                    host: {
                        class: 'data-table-row',
                        '[attr.aria-selected]': 'selected() ? "true" : null',
                        '[attr.data-selected]': 'selected() ? "" : null',
                    },
                }]
        }], propDecorators: { row: [{ type: i0.Input, args: [{ isSignal: true, alias: "row", required: true }] }] } });

/** Header checkbox for `selectionMode="multiple"`: checked / indeterminate over the current page. */
class UiTableSelectAll {
    store = inject(UiTableStore);
    i18n = inject(UI_TABLE_I18N);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableSelectAll, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiTableSelectAll, isStandalone: true, selector: "th[uiTableSelectAll]", host: { classAttribute: "data-table-selection-cell" }, ngImport: i0, template: `
    @if (store.selectionMode() === 'multiple') {
      <ui-checkbox
        size="sm"
        [checked]="store.allChecked()"
        [indeterminate]="store.indeterminate()"
        [disabled]="store.selectableKeysOnPage().length === 0"
        [ariaLabel]="i18n.selectAll"
        (checkedChange)="store.toggleAll()"
      />
    }
  `, isInline: true, dependencies: [{ kind: "component", type: UiCheckboxComponent, selector: "ui-checkbox", inputs: ["checked", "indeterminate", "disabled", "size", "label", "id", "ariaLabel"], outputs: ["checkedChange"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableSelectAll, decorators: [{
            type: Component,
            args: [{
                    // eslint-disable-next-line @angular-eslint/component-selector
                    selector: 'th[uiTableSelectAll]',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    imports: [UiCheckboxComponent],
                    host: { class: 'data-table-selection-cell' },
                    template: `
    @if (store.selectionMode() === 'multiple') {
      <ui-checkbox
        size="sm"
        [checked]="store.allChecked()"
        [indeterminate]="store.indeterminate()"
        [disabled]="store.selectableKeysOnPage().length === 0"
        [ariaLabel]="i18n.selectAll"
        (checkedChange)="store.toggleAll()"
      />
    }
  `,
                }]
        }] });
/** Row checkbox (`multiple`) or radio (`single`). Must sit inside `tr[uiTableRow]`. */
class UiTableSelect {
    store = inject(UiTableStore);
    rowRef = inject(UiTableRow);
    i18n = inject(UI_TABLE_I18N);
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    label = input(/* @ts-ignore */
    ...(ngDevMode ? [undefined, { debugName: "label" }] : /* istanbul ignore next */ []));
    ariaLabel = computed(() => this.label() ?? this.i18n.selectRow, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ariaLabel" }] : /* istanbul ignore next */ []));
    constructor() {
        const unregister = this.store.registerSelectable({
            row: this.rowRef.row,
            disabled: this.disabled,
        });
        inject(DestroyRef).onDestroy(unregister);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableSelect, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiTableSelect, isStandalone: true, selector: "td[uiTableSelect]", inputs: { disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "data-table-selection-cell" }, ngImport: i0, template: `
    @switch (store.selectionMode()) {
      @case ('multiple') {
        <ui-checkbox
          size="sm"
          [checked]="rowRef.selected()"
          [disabled]="disabled()"
          [ariaLabel]="ariaLabel()"
          (checkedChange)="store.toggleRow(rowRef.row(), $event)"
        />
      }
      @case ('single') {
        <input
          type="radio"
          class="radio radio-sm"
          [name]="store.radioName"
          [checked]="rowRef.selected()"
          [disabled]="disabled()"
          [attr.aria-label]="ariaLabel()"
          (change)="store.toggleRow(rowRef.row(), true)"
        />
      }
    }
  `, isInline: true, dependencies: [{ kind: "component", type: UiCheckboxComponent, selector: "ui-checkbox", inputs: ["checked", "indeterminate", "disabled", "size", "label", "id", "ariaLabel"], outputs: ["checkedChange"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiTableSelect, decorators: [{
            type: Component,
            args: [{
                    // eslint-disable-next-line @angular-eslint/component-selector
                    selector: 'td[uiTableSelect]',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    imports: [UiCheckboxComponent],
                    host: { class: 'data-table-selection-cell' },
                    template: `
    @switch (store.selectionMode()) {
      @case ('multiple') {
        <ui-checkbox
          size="sm"
          [checked]="rowRef.selected()"
          [disabled]="disabled()"
          [ariaLabel]="ariaLabel()"
          (checkedChange)="store.toggleRow(rowRef.row(), $event)"
        />
      }
      @case ('single') {
        <input
          type="radio"
          class="radio radio-sm"
          [name]="store.radioName"
          [checked]="rowRef.selected()"
          [disabled]="disabled()"
          [attr.aria-label]="ariaLabel()"
          (change)="store.toggleRow(rowRef.row(), true)"
        />
      }
    }
  `,
                }]
        }], ctorParameters: () => [], propDecorators: { disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] } });

/** Everything a template needs to build a table. Import this instead of individual pieces. */
const UI_TABLE = [
    UiTable,
    UiTableElement,
    UiTableRow,
    UiTableCell,
    UiTableEmpty,
    UiTableSelectAll,
    UiTableSelect,
    UiTableSort,
    UiTableFilter,
    UiTableFilterPanel,
    UiTableHeaderCell,
];

/**
 * Generated bundle index. Do not edit.
 */

export { UI_TABLE, UI_TABLE_I18N, UI_TABLE_I18N_EN, UiTable, UiTableCell, UiTableElement, UiTableEmpty, UiTableFilter, UiTableFilterPanel, UiTableHeaderCell, UiTableRow, UiTableSelect, UiTableSelectAll, UiTableSort, UiTableStore, compareValues, isEmptyFilterValue, tableVariants };
//# sourceMappingURL=libs-ui-table.mjs.map
