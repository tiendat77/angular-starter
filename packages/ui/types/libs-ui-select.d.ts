import * as _angular_core from '@angular/core';
import { TemplateRef, InjectionToken, Signal, OnInit } from '@angular/core';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { ControlValueAccessor } from '@angular/forms';
import { UiFormFieldControl, UiSize } from '@libs/ui/core';
import { UiFormFieldAppearance } from '@libs/ui/input';

interface HighlightSegment {
    text: string;
    match: boolean;
}

/**
 * Renders `text` with every match of the search term wrapped in `<mark class="select-mark">`.
 * The term comes from the surrounding `ui-select`, or from `uiHighlightTerm`.
 * Built with text nodes and elements, never innerHTML.
 */
declare class UiHighlightDirective {
    readonly text: _angular_core.InputSignal<string>;
    readonly term: _angular_core.InputSignal<string | undefined>;
    private readonly _select;
    private readonly _renderer;
    private readonly _host;
    protected readonly segments: _angular_core.Signal<HighlightSegment[]>;
    constructor();
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiHighlightDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiHighlightDirective, "[uiHighlight]", never, { "text": { "alias": "uiHighlight"; "required": true; "isSignal": true; }; "term": { "alias": "uiHighlightTerm"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Declares one option of a `ui-select`. It renders nothing itself: the select reads the
 * declaration and renders the row inside its listbox (aria's `ngOption` must live there).
 * Projected content becomes the row's content; without content the label is shown.
 */
declare class UiOptionComponent<T = unknown> {
    readonly value: _angular_core.InputSignal<T>;
    readonly label: _angular_core.InputSignal<string>;
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly content: _angular_core.Signal<TemplateRef<unknown>>;
    /** Whether the consumer projected any content (otherwise the select renders the label). */
    readonly hasContent: _angular_core.WritableSignal<boolean>;
    constructor();
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiOptionComponent<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiOptionComponent<any>, "ui-option", never, { "value": { "alias": "value"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": true; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

/** Custom "no results" content for `ui-select`. Context: `$implicit` = current search term. */
declare class UiSelectEmptyDirective {
    readonly template: TemplateRef<{
        $implicit: string;
    }>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiSelectEmptyDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<UiSelectEmptyDirective, "ng-template[uiSelectEmpty]", never, {}, {}, never, never, true, never>;
}

/** What a filter function receives for each option. */
interface UiSelectOptionRef<T> {
    readonly value: T;
    readonly label: string;
    readonly disabled: boolean;
}
type UiSelectFilterFn<T> = (term: string, option: UiSelectOptionRef<T>) => boolean;
/** Default filter: case- and accent-insensitive "label contains the trimmed term". */
declare const uiDefaultFilter: UiSelectFilterFn<any>;

/** What `[uiHighlight]` (and future option-level helpers) read from the surrounding select. */
interface UiSelectContext {
    readonly searchTerm: Signal<string>;
}
declare const UI_SELECT: InjectionToken<UiSelectContext>;

/**
 * Select built on `@angular/aria` (combobox + listbox) with a CDK connected overlay.
 * `<ui-option>` children are declarations; this component renders the actual `ngOption`
 * rows inside its listbox.
 */
declare class UiSelectComponent<T = unknown> extends UiFormFieldControl<T | T[]> implements ControlValueAccessor, UiSelectContext, OnInit {
    private readonly _uiConfig;
    private readonly _injector;
    private readonly _destroyRef;
    private readonly _host;
    readonly id: string;
    readonly value: _angular_core.ModelSignal<T | T[] | null>;
    readonly placeholder: _angular_core.InputSignal<string>;
    readonly size: _angular_core.InputSignal<UiSize>;
    readonly appearance: _angular_core.InputSignal<UiFormFieldAppearance>;
    readonly searchable: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Custom client-side matcher; `null`/`undefined` fall back to `uiDefaultFilter`. */
    readonly filterFn: _angular_core.InputSignal<UiSelectFilterFn<T> | null | undefined>;
    readonly searchDebounce: _angular_core.InputSignalWithTransform<number, unknown>;
    /** The consumer filters (usually remotely, via `(search)`); the select renders options as given. */
    readonly serverSearch: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly loading: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly multiple: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly compareWith: _angular_core.InputSignal<(a: T, b: T) => boolean>;
    readonly maxTagCount: _angular_core.InputSignal<number | null>;
    readonly allowClear: _angular_core.InputSignalWithTransform<boolean, unknown>;
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Debounced search term, emitted whenever `searchable` is on. */
    readonly search: _angular_core.OutputEmitterRef<string>;
    readonly openedChange: _angular_core.OutputEmitterRef<boolean>;
    protected readonly options: _angular_core.Signal<readonly UiOptionComponent<T>[]>;
    protected readonly emptyTemplate: _angular_core.Signal<UiSelectEmptyDirective | undefined>;
    private readonly _input;
    private readonly _panel;
    protected readonly positions: ConnectedPosition[];
    protected readonly open: _angular_core.WritableSignal<boolean>;
    readonly searchTerm: _angular_core.WritableSignal<string>;
    private readonly _cvaDisabled;
    private readonly _focused;
    private readonly _invalid;
    private _wasOpen;
    private _ngControl;
    private _onChange;
    private _onTouched;
    readonly $value: _angular_core.Signal<T | T[] | null>;
    readonly $disabled: _angular_core.Signal<boolean>;
    readonly $focused: _angular_core.Signal<boolean>;
    readonly $invalid: _angular_core.Signal<boolean>;
    readonly ariaTarget: _angular_core.Signal<HTMLInputElement | undefined>;
    private readonly _labels;
    protected readonly selectedValues: _angular_core.Signal<T[]>;
    protected readonly visibleOptions: _angular_core.Signal<readonly UiOptionComponent<T>[]>;
    /** Selected values mapped onto the rendered option values, so aria sees the same references. */
    protected readonly listboxValue: _angular_core.Signal<T[]>;
    protected readonly tags: _angular_core.Signal<{
        value: T;
        label: string;
    }[]>;
    protected readonly visibleTags: _angular_core.Signal<{
        value: T;
        label: string;
    }[]>;
    protected readonly hiddenTagCount: _angular_core.Signal<number>;
    protected readonly hasValue: _angular_core.Signal<boolean>;
    protected readonly showClear: _angular_core.Signal<boolean>;
    protected readonly selectedLabel: _angular_core.Signal<string>;
    protected readonly showPlaceholder: _angular_core.Signal<boolean>;
    protected readonly emptyText: _angular_core.Signal<string>;
    protected readonly triggerClass: _angular_core.Signal<string>;
    constructor();
    ngOnInit(): void;
    writeValue(value: T | T[] | null): void;
    registerOnChange(fn: (value: T | T[] | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    setOpen(open: boolean): void;
    clear(): void;
    protected onFocusIn(): void;
    protected onFocusOut(event: FocusEvent): void;
    /** Keeps focus in the input when the non-input parts of the trigger are pressed. */
    protected onTriggerMousedown(event: MouseEvent): void;
    protected onTriggerClick(): void;
    /**
     * A non-searchable select keeps its input empty. (A method, not an inline `cond && preventDefault()`
     * expression: Angular calls preventDefault() on any listener that returns `false`.)
     */
    protected onTriggerBeforeInput(event: Event): void;
    protected onTriggerKeydown(event: KeyboardEvent): void;
    protected onListboxChange(next: T[]): void;
    protected removeValue(value: T): void;
    private _remember;
    private _commit;
    private _updateInvalid;
    private _eq;
    private _resetSearch;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<UiSelectComponent<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<UiSelectComponent<any>, "ui-select", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "appearance": { "alias": "appearance"; "required": false; "isSignal": true; }; "searchable": { "alias": "searchable"; "required": false; "isSignal": true; }; "filterFn": { "alias": "filterFn"; "required": false; "isSignal": true; }; "searchDebounce": { "alias": "searchDebounce"; "required": false; "isSignal": true; }; "serverSearch": { "alias": "serverSearch"; "required": false; "isSignal": true; }; "loading": { "alias": "loading"; "required": false; "isSignal": true; }; "multiple": { "alias": "multiple"; "required": false; "isSignal": true; }; "compareWith": { "alias": "compareWith"; "required": false; "isSignal": true; }; "maxTagCount": { "alias": "maxTagCount"; "required": false; "isSignal": true; }; "allowClear": { "alias": "allowClear"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "search": "search"; "openedChange": "openedChange"; }, ["options", "emptyTemplate"], never, true, never>;
}

export { UI_SELECT, UiHighlightDirective, UiOptionComponent, UiSelectComponent, UiSelectEmptyDirective, uiDefaultFilter };
export type { UiSelectContext, UiSelectFilterFn, UiSelectOptionRef };
