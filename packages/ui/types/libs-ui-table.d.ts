import * as _angular_core from '@angular/core';
import { Signal, WritableSignal, TemplateRef, OnInit, InjectionToken } from '@angular/core';
import { PageEvent } from '@libs/ui/paginator';
import * as _libs_ui_table from '@libs/ui/table';
import { ConnectedPosition } from '@angular/cdk/overlay';

type UiTableSortOrder = 'ascend' | 'descend' | null;
type UiTableDensity = 'compact' | 'middle' | 'default';
type UiTableSelectionMode = 'none' | 'single' | 'multiple';
type UiTableAlign = 'start' | 'center' | 'end';
type UiTableSortFn<T> = (a: T, b: T) => number;
type UiTableFilterFn<T> = (value: unknown, row: T) => boolean;
interface UiTableFilterOption {
    text: string;
    value: unknown;
}
interface UiTableQueryParams {
    pageIndex: number;
    pageSize: number;
    sort: {
        key: string;
        order: 'ascend' | 'descend';
    } | null;
    /** Only columns with a non-empty value. */
    filters: {
        key: string;
        value: unknown;
    }[];
}
interface UiTableSortRegistration<T> {
    sortFn: Signal<UiTableSortFn<T> | true | null>;
    sortDirections: Signal<readonly UiTableSortOrder[]>;
    sortOrder: WritableSignal<UiTableSortOrder>;
}
interface UiTableFilterRegistration<T> {
    filterFn: Signal<UiTableFilterFn<T> | null>;
    filterValue: WritableSignal<unknown>;
}
interface UiTableSelectableRegistration<T> {
    row: Signal<T>;
    disabled: Signal<boolean>;
}
interface UiTableLayout {
    /** Sum of `colSpan` over the first header row; used for empty/skeleton rows. */
    columnCount: number;
    /** Declared CSS width per column index, `null` when unknown. */
    widths: readonly (string | null)[];
    /** Column index of the last left-fixed header cell, or -1. */
    leftEdge: number;
    /** Column index of the first right-fixed header cell, or -1. */
    rightEdge: number;
}
interface UiTableStoreSources<T, K> {
    data: Signal<readonly T[]>;
    rowKey: Signal<((row: T) => K) | undefined>;
    frontPagination: Signal<boolean>;
    total: Signal<number | undefined>;
    pageIndex: WritableSignal<number>;
    pageSize: WritableSignal<number>;
    selectionMode: Signal<UiTableSelectionMode>;
    selectedKeys: WritableSignal<ReadonlySet<K>>;
    onQueryParams?: (params: UiTableQueryParams) => void;
}

/**
 * Cell options: fixed (sticky) left/right, alignment, ellipsis, width. Also matches the feature
 * cells so `[left]`/`[right]` work on them, and so sort + filter on one `th` match it only once.
 */
declare class UiTableCell {
    private readonly store;
    private readonly el;
    readonly left: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly right: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly align: _angular_core.InputSignal<UiTableAlign | null>;
    readonly ellipsis: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly width: _angular_core.InputSignal<string | null>;
    private readonly index;
    protected readonly leftOffset: _angular_core.Signal<string | null>;
    protected readonly rightOffset: _angular_core.Signal<string | null>;
    protected readonly fixEdge: _angular_core.Signal<"left" | "right" | null>;
    constructor();
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTableCell, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiTableCell, "th[uiTableCell], td[uiTableCell], th[uiTableSort], th[uiTableFilter], th[uiTableSelectAll], td[uiTableSelect]", ["uiTableCell"], { "left": { "alias": "left"; "required": false; "isSignal": true; }; "right": { "alias": "right"; "required": false; "isSignal": true; }; "align": { "alias": "align"; "required": false; "isSignal": true; }; "ellipsis": { "alias": "ellipsis"; "required": false; "isSignal": true; }; "width": { "alias": "width"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/** Custom empty state: `<ng-template uiTableEmpty>…</ng-template>` inside `ui-table`. */
declare class UiTableEmpty {
    readonly templateRef: TemplateRef<void>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTableEmpty, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiTableEmpty, "ng-template[uiTableEmpty]", never, {}, {}, never, never, true, never>;
}

/**
 * Headless state for `ui-table`: data → filtered → sorted → paged → viewData.
 * `ui-table` provides it and connects its inputs; every table directive injects it.
 */
declare class UiTableStore<T = unknown, K = unknown> {
    private _sources?;
    private readonly _sorts;
    private readonly _filters;
    private readonly _selectables;
    private readonly _layout;
    /** Shared `name` for single-selection radios. */
    readonly radioName: string;
    readonly layout: _angular_core.Signal<UiTableLayout>;
    connect(sources: UiTableStoreSources<T, K>): void;
    protected get src(): UiTableStoreSources<T, K>;
    registerSort(key: string, registration: UiTableSortRegistration<T>): () => void;
    registerFilter(key: string, registration: UiTableFilterRegistration<T>): () => void;
    readonly activeSort: _angular_core.Signal<{
        key: string;
        order: "ascend" | "descend";
        registration: UiTableSortRegistration<T>;
    } | null>;
    readonly filtered: _angular_core.Signal<readonly T[]>;
    readonly sorted: _angular_core.Signal<readonly T[]>;
    readonly total: _angular_core.Signal<number>;
    readonly lastPage: _angular_core.Signal<number>;
    /** The page actually shown. Clamped locally; the `pageIndex` model itself is never rewritten here. */
    readonly currentPage: _angular_core.Signal<number>;
    readonly viewData: _angular_core.Signal<readonly T[]>;
    sort(key: string): void;
    setSort(key: string, order: UiTableSortOrder): void;
    setFilter(key: string, value: unknown): void;
    setPage(pageIndex: number): void;
    setPageSize(pageSize: number): void;
    queryParams(): UiTableQueryParams;
    readonly selectionMode: _angular_core.Signal<_libs_ui_table.UiTableSelectionMode>;
    readonly selectionEnabled: _angular_core.Signal<boolean>;
    keyOf(row: T): K;
    isSelected(row: T): boolean;
    registerSelectable(registration: UiTableSelectableRegistration<T>): () => void;
    readonly selectableKeysOnPage: _angular_core.Signal<readonly K[]>;
    readonly allChecked: _angular_core.Signal<boolean>;
    readonly indeterminate: _angular_core.Signal<boolean>;
    /** Selected rows found in the current `data` (other pages in server mode are unknown). */
    readonly selectedRows: _angular_core.Signal<readonly T[]>;
    toggleRow(row: T, checked: boolean): void;
    toggleAll(): void;
    assertSelectionConfig(): void;
    findDuplicateKeys(): K[];
    setLayout(layout: UiTableLayout): void;
    /** CSS `left` for a left-fixed cell: the widths of every column before it. */
    leftOffset(index: number): string;
    /** CSS `right` for a right-fixed cell: the widths of every column after it. */
    rightOffset(index: number): string;
    private emit;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTableStore<any, any>, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<UiTableStore<any, any>>;
}

declare class UiTable<T = unknown, K = unknown> implements OnInit {
    readonly data: _angular_core.InputSignal<readonly T[]>;
    readonly rowKey: _angular_core.InputSignal<((row: T) => K) | undefined>;
    readonly loading: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly frontPagination: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly total: _angular_core.InputSignal<number | undefined>;
    readonly pageIndex: _angular_core.ModelSignal<number>;
    readonly pageSize: _angular_core.ModelSignal<number>;
    readonly pageSizeOptions: _angular_core.InputSignal<number[]>;
    readonly showPagination: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly selectionMode: _angular_core.InputSignal<UiTableSelectionMode>;
    readonly selectedKeys: _angular_core.ModelSignal<ReadonlySet<K>>;
    readonly density: _angular_core.InputSignal<UiTableDensity>;
    readonly bordered: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly striped: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Max body height (e.g. `'400px'`); turns on the sticky header. */
    readonly scrollY: _angular_core.InputSignal<string | null>;
    /** Min table width (e.g. `'1000px'`); turns on horizontal scroll. */
    readonly scrollX: _angular_core.InputSignal<string | null>;
    readonly queryParamsChange: _angular_core.OutputEmitterRef<UiTableQueryParams>;
    readonly store: UiTableStore<T, K>;
    readonly viewData: _angular_core.Signal<readonly T[]>;
    readonly emptyTemplate: _angular_core.Signal<UiTableEmpty | undefined>;
    private readonly container;
    constructor();
    ngOnInit(): void;
    protected onPage(event: PageEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTable<any, any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiTable<any, any>, "ui-table", ["uiTable"], { "data": { "alias": "data"; "required": false; "isSignal": true; }; "rowKey": { "alias": "rowKey"; "required": false; "isSignal": true; }; "loading": { "alias": "loading"; "required": false; "isSignal": true; }; "frontPagination": { "alias": "frontPagination"; "required": false; "isSignal": true; }; "total": { "alias": "total"; "required": false; "isSignal": true; }; "pageIndex": { "alias": "pageIndex"; "required": false; "isSignal": true; }; "pageSize": { "alias": "pageSize"; "required": false; "isSignal": true; }; "pageSizeOptions": { "alias": "pageSizeOptions"; "required": false; "isSignal": true; }; "showPagination": { "alias": "showPagination"; "required": false; "isSignal": true; }; "selectionMode": { "alias": "selectionMode"; "required": false; "isSignal": true; }; "selectedKeys": { "alias": "selectedKeys"; "required": false; "isSignal": true; }; "density": { "alias": "density"; "required": false; "isSignal": true; }; "bordered": { "alias": "bordered"; "required": false; "isSignal": true; }; "striped": { "alias": "striped"; "required": false; "isSignal": true; }; "scrollY": { "alias": "scrollY"; "required": false; "isSignal": true; }; "scrollX": { "alias": "scrollX"; "required": false; "isSignal": true; }; }, { "pageIndex": "pageIndexChange"; "pageSize": "pageSizeChange"; "selectedKeys": "selectedKeysChange"; "queryParamsChange": "queryParamsChange"; }, ["emptyTemplate"], ["table", "*"], true, never>;
}

/** Marks the consumer's `<table>` inside `ui-table`: classes, busy state, state rows, layout. */
declare class UiTableElement implements OnInit {
    protected readonly table: UiTable<any, any>;
    private readonly store;
    private readonly el;
    private readonly vcr;
    private readonly injector;
    private readonly warnedColumns;
    protected readonly classes: _angular_core.Signal<string>;
    constructor();
    ngOnInit(): void;
    private measure;
    /** A fixed cell's offset is the sum of the widths beside it, so those widths must be declared. */
    private warnMissingWidths;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTableElement, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiTableElement, "table[uiTableElement]", never, {}, {}, never, never, true, never>;
}

interface UiTableFilterPanelContext {
    /** The context itself, so `let-ctx` gives `ctx.value()`, `ctx.confirm()`, … */
    $implicit: UiTableFilterPanelContext;
    /** The staged (not yet applied) value. */
    value: Signal<unknown>;
    setValue(value: unknown): void;
    /** Applies the staged value and closes the panel. */
    confirm(): void;
    /** Clears the column filter and closes the panel. */
    reset(): void;
}
/** Custom filter UI: `<ng-template uiTableFilterPanel let-ctx>…</ng-template>` inside `th[uiTableFilter]`. */
declare class UiTableFilterPanel {
    readonly templateRef: TemplateRef<UiTableFilterPanelContext>;
    static ngTemplateContextGuard(_dir: UiTableFilterPanel, _ctx: unknown): _ctx is UiTableFilterPanelContext;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTableFilterPanel, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiTableFilterPanel, "ng-template[uiTableFilterPanel]", never, {}, {}, never, never, true, never>;
}

/**
 * Filterable column. Choices are staged in the panel and applied on OK / `confirm()`.
 * Without `filterFn` the column is filtered by the server: the table only emits `queryParamsChange`.
 */
declare class UiTableFilter<T = unknown> implements OnInit {
    private readonly store;
    private readonly destroyRef;
    readonly uiTableFilter: _angular_core.InputSignal<string>;
    readonly filters: _angular_core.InputSignal<readonly UiTableFilterOption[]>;
    readonly filterMultiple: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly filterFn: _angular_core.InputSignal<UiTableFilterFn<T> | null>;
    readonly filterValue: _angular_core.ModelSignal<unknown>;
    readonly panelTemplate: _angular_core.Signal<UiTableFilterPanel | undefined>;
    readonly isOpen: _angular_core.WritableSignal<boolean>;
    readonly staged: _angular_core.WritableSignal<unknown>;
    readonly active: _angular_core.Signal<boolean>;
    readonly panelContext: UiTableFilterPanelContext;
    ngOnInit(): void;
    open(): void;
    /** Closes without applying staged changes. */
    close(): void;
    toggleOpen(): void;
    isStaged(value: unknown): boolean;
    stage(value: unknown, checked?: boolean): void;
    confirm(): void;
    reset(): void;
    private createPanelContext;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTableFilter<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiTableFilter<any>, "th[uiTableFilter]", ["uiTableFilter"], { "uiTableFilter": { "alias": "uiTableFilter"; "required": true; "isSignal": true; }; "filters": { "alias": "filters"; "required": false; "isSignal": true; }; "filterMultiple": { "alias": "filterMultiple"; "required": false; "isSignal": true; }; "filterFn": { "alias": "filterFn"; "required": false; "isSignal": true; }; "filterValue": { "alias": "filterValue"; "required": false; "isSignal": true; }; }, { "filterValue": "filterValueChange"; }, ["panelTemplate"], never, true, never>;
}

/**
 * Sortable column. `sortFn: true` uses the default comparator on `row[key]`;
 * `null` (default) means the server sorts: the table only emits `queryParamsChange`.
 */
declare class UiTableSort<T = unknown> implements OnInit {
    private readonly store;
    private readonly destroyRef;
    readonly uiTableSort: _angular_core.InputSignal<string>;
    readonly sortFn: _angular_core.InputSignal<true | UiTableSortFn<T> | null>;
    readonly sortDirections: _angular_core.InputSignal<readonly UiTableSortOrder[]>;
    readonly sortOrder: _angular_core.ModelSignal<UiTableSortOrder>;
    readonly ariaSort: _angular_core.Signal<"none" | "ascending" | "descending">;
    ngOnInit(): void;
    toggle(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTableSort<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiTableSort<any>, "th[uiTableSort]", ["uiTableSort"], { "uiTableSort": { "alias": "uiTableSort"; "required": true; "isSignal": true; }; "sortFn": { "alias": "sortFn"; "required": false; "isSignal": true; }; "sortDirections": { "alias": "sortDirections"; "required": false; "isSignal": true; }; "sortOrder": { "alias": "sortOrder"; "required": false; "isSignal": true; }; }, { "sortOrder": "sortOrderChange"; }, never, never, true, never>;
}

/**
 * Renders sortable/filterable header content. Sort and filter are directives so both can sit on
 * one `th`; Angular allows only one component per element, so this is the single renderer.
 */
declare class UiTableHeaderCell {
    protected readonly sort: UiTableSort<any> | null;
    protected readonly filter: UiTableFilter<any> | null;
    protected readonly i18n: _libs_ui_table.UiTableI18n;
    private readonly announcer;
    private readonly labelEl;
    protected readonly positions: ConnectedPosition[];
    protected readonly radioName: string;
    /** Plain header text, used for announcements and the filter's accessible name. */
    protected readonly headerText: _angular_core.WritableSignal<string>;
    constructor();
    protected onSortClick(): void;
    protected onOverlayKeydown(event: KeyboardEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTableHeaderCell, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiTableHeaderCell, "th[uiTableSort], th[uiTableFilter]", never, {}, {}, never, ["*"], true, never>;
}

declare class UiTableRow<T = unknown> {
    private readonly store;
    readonly row: _angular_core.InputSignal<T>;
    readonly selected: _angular_core.Signal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTableRow<any>, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiTableRow<any>, "tr[uiTableRow]", ["uiTableRow"], { "row": { "alias": "row"; "required": true; "isSignal": true; }; }, {}, never, never, true, never>;
}

/** Header checkbox for `selectionMode="multiple"`: checked / indeterminate over the current page. */
declare class UiTableSelectAll {
    protected readonly store: UiTableStore<any, any>;
    protected readonly i18n: _libs_ui_table.UiTableI18n;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTableSelectAll, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiTableSelectAll, "th[uiTableSelectAll]", never, {}, {}, never, never, true, never>;
}
/** Row checkbox (`multiple`) or radio (`single`). Must sit inside `tr[uiTableRow]`. */
declare class UiTableSelect<T = unknown> {
    protected readonly store: UiTableStore<T, unknown>;
    protected readonly rowRef: UiTableRow<T>;
    private readonly i18n;
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly label: _angular_core.InputSignal<string | undefined>;
    protected readonly ariaLabel: _angular_core.Signal<string>;
    constructor();
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiTableSelect<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiTableSelect<any>, "td[uiTableSelect]", never, { "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/** Everything a template needs to build a table. Import this instead of individual pieces. */
declare const UI_TABLE: readonly [typeof UiTable, typeof UiTableElement, typeof UiTableRow, typeof UiTableCell, typeof UiTableEmpty, typeof UiTableSelectAll, typeof UiTableSelect, typeof UiTableSort, typeof UiTableFilter, typeof UiTableFilterPanel, typeof UiTableHeaderCell];

declare function isEmptyFilterValue(value: unknown): boolean;
/** Default cell comparator. `null`/`undefined` always sort last, whatever the direction. */
declare function compareValues(a: unknown, b: unknown, order: 'ascend' | 'descend'): number;

interface UiTableI18n {
    selectAll: string;
    selectRow: string;
    filter: (column: string) => string;
    filterReset: string;
    filterConfirm: string;
    empty: string;
    sortedAscending: (column: string) => string;
    sortedDescending: (column: string) => string;
    sortCleared: (column: string) => string;
}
declare const UI_TABLE_I18N_EN: UiTableI18n;
declare const UI_TABLE_I18N: InjectionToken<UiTableI18n>;

interface TableVariantProps {
    density?: UiTableDensity;
    bordered?: boolean;
    striped?: boolean;
}
declare function tableVariants(props?: TableVariantProps, extraClass?: string): string;

export { UI_TABLE, UI_TABLE_I18N, UI_TABLE_I18N_EN, UiTable, UiTableCell, UiTableElement, UiTableEmpty, UiTableFilter, UiTableFilterPanel, UiTableHeaderCell, UiTableRow, UiTableSelect, UiTableSelectAll, UiTableSort, UiTableStore, compareValues, isEmptyFilterValue, tableVariants };
export type { TableVariantProps, UiTableAlign, UiTableDensity, UiTableFilterFn, UiTableFilterOption, UiTableFilterPanelContext, UiTableFilterRegistration, UiTableI18n, UiTableLayout, UiTableQueryParams, UiTableSelectableRegistration, UiTableSelectionMode, UiTableSortFn, UiTableSortOrder, UiTableSortRegistration, UiTableStoreSources };
