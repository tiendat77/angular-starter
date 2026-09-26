import * as i0 from '@angular/core';
import { InjectionToken, input, inject, Renderer2, ElementRef, computed, effect, Directive, booleanAttribute, viewChild, signal, afterNextRender, ChangeDetectionStrategy, Component, TemplateRef, untracked, Injector, DestroyRef, model, numberAttribute, output, contentChildren, contentChild, afterRenderEffect, forwardRef } from '@angular/core';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkOverlayOrigin, CdkConnectedOverlay } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UiFormFieldControl, UI_CONFIG, cn } from '@libs/ui/core';
import { inputVariants } from '@libs/ui/input';
import { skip, filter, debounce, timer, distinctUntilChanged } from 'rxjs';

/** Lower-cases and removes diacritics (NFD + combining marks), folding Vietnamese đ/Đ to d. */
function normalizeForSearch(text) {
    return text
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase();
}
/** Default filter: case- and accent-insensitive "label contains the trimmed term". */
const uiDefaultFilter = (term, option) => {
    const needle = normalizeForSearch(term.trim());
    return needle === '' || normalizeForSearch(option.label).includes(needle);
};

/**
 * Splits `text` into plain and matching segments for `term`, matching the same way as
 * `uiDefaultFilter` (case/accent-insensitive) while returning the original characters.
 */
function splitHighlight(text, term) {
    if (!text)
        return [];
    const needle = normalizeForSearch(term.trim());
    if (!needle)
        return [{ text, match: false }];
    // Normalized haystack plus, for each normalized char, the index of its source char in `text`
    let haystack = '';
    const sourceIndex = [];
    for (let i = 0; i < text.length;) {
        const char = String.fromCodePoint(text.codePointAt(i));
        for (const normalizedChar of normalizeForSearch(char)) {
            haystack += normalizedChar;
            sourceIndex.push(i);
        }
        i += char.length;
    }
    const segments = [];
    let cursor = 0;
    let from = 0;
    for (let hit = haystack.indexOf(needle, from); hit !== -1; hit = haystack.indexOf(needle, from)) {
        const start = sourceIndex[hit];
        const lastSource = sourceIndex[hit + needle.length - 1];
        const end = lastSource + String.fromCodePoint(text.codePointAt(lastSource)).length;
        if (start > cursor)
            segments.push({ text: text.slice(cursor, start), match: false });
        segments.push({ text: text.slice(start, end), match: true });
        cursor = end;
        from = hit + needle.length;
    }
    if (cursor < text.length)
        segments.push({ text: text.slice(cursor), match: false });
    return segments;
}

const UI_SELECT = new InjectionToken('UI_SELECT');

/**
 * Renders `text` with every match of the search term wrapped in `<mark class="select-mark">`.
 * The term comes from the surrounding `ui-select`, or from `uiHighlightTerm`.
 * Built with text nodes and elements, never innerHTML.
 */
class UiHighlightDirective {
    text = input.required({ ...(ngDevMode ? { debugName: "text" } : /* istanbul ignore next */ {}), alias: 'uiHighlight' });
    term = input(undefined, { ...(ngDevMode ? { debugName: "term" } : /* istanbul ignore next */ {}), alias: 'uiHighlightTerm' });
    _select = inject(UI_SELECT, { optional: true });
    _renderer = inject(Renderer2);
    _host = inject(ElementRef);
    segments = computed(() => splitHighlight(this.text(), this.term() ?? this._select?.searchTerm() ?? ''), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "segments" }] : /* istanbul ignore next */ []));
    constructor() {
        effect(() => {
            const host = this._host.nativeElement;
            const segments = this.segments();
            while (host.firstChild) {
                this._renderer.removeChild(host, host.firstChild);
            }
            for (const segment of segments) {
                const text = this._renderer.createText(segment.text);
                if (segment.match) {
                    const mark = this._renderer.createElement('mark');
                    this._renderer.addClass(mark, 'select-mark');
                    this._renderer.appendChild(mark, text);
                    this._renderer.appendChild(host, mark);
                }
                else {
                    this._renderer.appendChild(host, text);
                }
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiHighlightDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "22.0.5", type: UiHighlightDirective, isStandalone: true, selector: "[uiHighlight]", inputs: { text: { classPropertyName: "text", publicName: "uiHighlight", isSignal: true, isRequired: true, transformFunction: null }, term: { classPropertyName: "term", publicName: "uiHighlightTerm", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiHighlightDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: '[uiHighlight]',
                }]
        }], ctorParameters: () => [], propDecorators: { text: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiHighlight", required: true }] }], term: [{ type: i0.Input, args: [{ isSignal: true, alias: "uiHighlightTerm", required: false }] }] } });

function isMeaningfulNode(node) {
    return (node.nodeType === Node.ELEMENT_NODE ||
        (node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim()));
}
/**
 * Declares one option of a `ui-select`. It renders nothing itself: the select reads the
 * declaration and renders the row inside its listbox (aria's `ngOption` must live there).
 * Projected content becomes the row's content; without content the label is shown.
 */
class UiOptionComponent {
    value = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    label = input.required(/* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    content = viewChild.required('content');
    /** Whether the consumer projected any content (otherwise the select renders the label). */
    hasContent = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hasContent" }] : /* istanbul ignore next */ []));
    constructor() {
        afterNextRender(() => {
            // Render the captured content once, off-DOM, just to see whether anything was projected
            const view = this.content().createEmbeddedView(null);
            this.hasContent.set(view.rootNodes.some(isMeaningfulNode));
            view.destroy();
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiOptionComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.2.0", version: "22.0.5", type: UiOptionComponent, isStandalone: true, selector: "ui-option", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null } }, viewQueries: [{ propertyName: "content", first: true, predicate: ["content"], descendants: true, isSignal: true }], ngImport: i0, template: '<ng-template #content><ng-content /></ng-template>', isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiOptionComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ui-option',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: '<ng-template #content><ng-content /></ng-template>',
                }]
        }], ctorParameters: () => [], propDecorators: { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], content: [{ type: i0.ViewChild, args: ['content', { isSignal: true }] }] } });

/** Custom "no results" content for `ui-select`. Context: `$implicit` = current search term. */
class UiSelectEmptyDirective {
    template = inject(TemplateRef);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiSelectEmptyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "22.0.5", type: UiSelectEmptyDirective, isStandalone: true, selector: "ng-template[uiSelectEmpty]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiSelectEmptyDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'ng-template[uiSelectEmpty]',
                }]
        }] });

/**
 * Remembers the label of every selected value, so tags and the single display keep their text
 * when the matching `<ui-option>` is no longer rendered (e.g. server search swapped the options).
 * Reads are reactive; writes are safe inside effects.
 */
class SelectLabelCache {
    _compareWith;
    _entries = signal([], /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_entries" }] : /* istanbul ignore next */ []));
    constructor(_compareWith) {
        this._compareWith = _compareWith;
    }
    set(value, label) {
        untracked(() => {
            const eq = this._compareWith();
            const entries = this._entries();
            const index = entries.findIndex((e) => eq(e.value, value));
            if (index === -1) {
                this._entries.set([...entries, { value, label }]);
            }
            else if (entries[index].label !== label) {
                const next = [...entries];
                next[index] = { value, label };
                this._entries.set(next);
            }
        });
    }
    get(value) {
        const eq = this._compareWith();
        return this._entries().find((e) => eq(e.value, value))?.label;
    }
}

let nextSelectId = 0;
const PANEL_POSITIONS = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
];
function toOptionRef(option) {
    return { value: option.value(), label: option.label(), disabled: option.disabled() };
}
/**
 * Select built on `@angular/aria` (combobox + listbox) with a CDK connected overlay.
 * `<ui-option>` children are declarations; this component renders the actual `ngOption`
 * rows inside its listbox.
 */
class UiSelectComponent extends UiFormFieldControl {
    _uiConfig = inject(UI_CONFIG, { optional: true });
    _injector = inject(Injector);
    _destroyRef = inject(DestroyRef);
    _host = inject(ElementRef);
    id = `ui-select-${nextSelectId++}`;
    // -----------------------------------------------------------------------------------------------------
    // @ Inputs
    // -----------------------------------------------------------------------------------------------------
    value = model(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    placeholder = input('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "placeholder" }] : /* istanbul ignore next */ []));
    size = input(this._uiConfig?.defaultSize ?? 'md', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "size" }] : /* istanbul ignore next */ []));
    appearance = input(this._uiConfig?.formField?.appearance ?? 'outline', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "appearance" }] : /* istanbul ignore next */ []));
    searchable = input(false, { ...(ngDevMode ? { debugName: "searchable" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Custom client-side matcher; `null`/`undefined` fall back to `uiDefaultFilter`. */
    filterFn = input(uiDefaultFilter, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "filterFn" }] : /* istanbul ignore next */ []));
    searchDebounce = input(300, { ...(ngDevMode ? { debugName: "searchDebounce" } : /* istanbul ignore next */ {}), transform: numberAttribute });
    /** The consumer filters (usually remotely, via `(search)`); the select renders options as given. */
    serverSearch = input(false, { ...(ngDevMode ? { debugName: "serverSearch" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    loading = input(false, { ...(ngDevMode ? { debugName: "loading" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    multiple = input(false, { ...(ngDevMode ? { debugName: "multiple" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    compareWith = input((a, b) => a === b, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "compareWith" }] : /* istanbul ignore next */ []));
    maxTagCount = input(null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "maxTagCount" }] : /* istanbul ignore next */ []));
    allowClear = input(false, { ...(ngDevMode ? { debugName: "allowClear" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    disabled = input(false, { ...(ngDevMode ? { debugName: "disabled" } : /* istanbul ignore next */ {}), transform: booleanAttribute });
    /** Debounced search term, emitted whenever `searchable` is on. */
    search = output();
    openedChange = output();
    // -----------------------------------------------------------------------------------------------------
    // @ Content / view
    // -----------------------------------------------------------------------------------------------------
    options = contentChildren(UiOptionComponent, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "options" }] : /* istanbul ignore next */ []));
    emptyTemplate = contentChild(UiSelectEmptyDirective, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emptyTemplate" }] : /* istanbul ignore next */ []));
    _input = viewChild('trigger', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_input" }] : /* istanbul ignore next */ []));
    _panel = viewChild('panel', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_panel" }] : /* istanbul ignore next */ []));
    // -----------------------------------------------------------------------------------------------------
    // @ State
    // -----------------------------------------------------------------------------------------------------
    positions = PANEL_POSITIONS;
    open = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "open" }] : /* istanbul ignore next */ []));
    searchTerm = signal('', /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "searchTerm" }] : /* istanbul ignore next */ []));
    _cvaDisabled = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_cvaDisabled" }] : /* istanbul ignore next */ []));
    _focused = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_focused" }] : /* istanbul ignore next */ []));
    _invalid = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "_invalid" }] : /* istanbul ignore next */ []));
    _wasOpen = false;
    _ngControl = null;
    _onChange = () => undefined;
    _onTouched = () => undefined;
    // UiFormFieldControl
    $value = this.value.asReadonly();
    $disabled = computed(() => this.disabled() || this._cvaDisabled(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "$disabled" }] : /* istanbul ignore next */ []));
    $focused = this._focused.asReadonly();
    $invalid = this._invalid.asReadonly();
    ariaTarget = computed(() => this._input()?.nativeElement, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "ariaTarget" }] : /* istanbul ignore next */ []));
    _labels = new SelectLabelCache(() => this.compareWith());
    selectedValues = computed(() => {
        const value = this.value();
        if (value == null)
            return [];
        return this.multiple() ? value : [value];
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedValues" }] : /* istanbul ignore next */ []));
    visibleOptions = computed(() => {
        const all = this.options();
        const term = this.searchTerm();
        if (!this.searchable() || this.serverSearch() || !term.trim())
            return all;
        const matches = this.filterFn() ?? uiDefaultFilter;
        return all.filter((o) => matches(term, toOptionRef(o)));
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "visibleOptions" }] : /* istanbul ignore next */ []));
    /** Selected values mapped onto the rendered option values, so aria sees the same references. */
    listboxValue = computed(() => {
        const options = this.options();
        return this.selectedValues().map((v) => options.find((o) => this._eq(o.value(), v))?.value() ?? v);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "listboxValue" }] : /* istanbul ignore next */ []));
    tags = computed(() => this.selectedValues().map((value) => ({ value, label: this._labels.get(value) ?? '' })), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "tags" }] : /* istanbul ignore next */ []));
    visibleTags = computed(() => {
        const max = this.maxTagCount();
        const tags = this.tags();
        return max == null ? tags : tags.slice(0, max);
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "visibleTags" }] : /* istanbul ignore next */ []));
    hiddenTagCount = computed(() => this.tags().length - this.visibleTags().length, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hiddenTagCount" }] : /* istanbul ignore next */ []));
    hasValue = computed(() => this.selectedValues().length > 0, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "hasValue" }] : /* istanbul ignore next */ []));
    showClear = computed(() => this.allowClear() && this.hasValue() && !this.$disabled(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "showClear" }] : /* istanbul ignore next */ []));
    selectedLabel = computed(() => {
        const value = this.selectedValues()[0];
        return value === undefined ? '' : (this._labels.get(value) ?? '');
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "selectedLabel" }] : /* istanbul ignore next */ []));
    showPlaceholder = computed(() => !this.hasValue() && !this.searchTerm(), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "showPlaceholder" }] : /* istanbul ignore next */ []));
    emptyText = computed(() => {
        const term = this.searchTerm().trim();
        return term ? `No results for "${term}"` : 'No options';
    }, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "emptyText" }] : /* istanbul ignore next */ []));
    triggerClass = computed(() => cn(inputVariants({ appearance: this.appearance(), size: this.size() }), 'select-trigger', this.multiple() && 'select-multiple'), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "triggerClass" }] : /* istanbul ignore next */ []));
    constructor() {
        super();
        // aria's `value` input owns [value] on the trigger, so the DOM text is written here
        effect(() => {
            const term = this.searchTerm();
            const el = this._input()?.nativeElement;
            if (el && el.value !== term)
                el.value = term;
        });
        // Emit openedChange on real transitions; closing discards an unfinished search
        effect(() => {
            const isOpen = this.open();
            untracked(() => {
                if (isOpen === this._wasOpen)
                    return;
                this._wasOpen = isOpen;
                if (!isOpen)
                    this._resetSearch();
                this.openedChange.emit(isOpen);
            });
        });
        // Disabling while open closes the panel
        effect(() => {
            if (this.$disabled())
                untracked(() => this.open.set(false));
        });
        // Labels of the current value, whenever a matching option is declared. After render, because
        // options created in the consumer's @for only have their required inputs bound by then
        afterRenderEffect(() => {
            const selected = this.selectedValues();
            for (const option of this.options()) {
                const value = option.value();
                if (selected.some((s) => this._eq(s, value)))
                    this._labels.set(value, option.label());
            }
        });
        toObservable(this.searchTerm)
            .pipe(skip(1), filter(() => this.searchable()), debounce(() => timer(this.searchDebounce())), distinctUntilChanged(), takeUntilDestroyed())
            .subscribe((term) => this.search.emit(term));
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle / ControlValueAccessor
    // -----------------------------------------------------------------------------------------------------
    ngOnInit() {
        // Resolved lazily: this component is its own NG_VALUE_ACCESSOR, so injecting NgControl in
        // the constructor would be circular (NG0200)
        this._ngControl = this._injector.get(NgControl, null, { optional: true, self: true });
        const control = this._ngControl?.control;
        if (!control)
            return;
        this._updateInvalid();
        control.events
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe(() => this._updateInvalid());
    }
    writeValue(value) {
        this.value.set(value);
    }
    registerOnChange(fn) {
        this._onChange = fn;
    }
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this._cvaDisabled.set(isDisabled);
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    setOpen(open) {
        if (open && this.$disabled())
            return;
        this.open.set(open);
    }
    clear() {
        this._commit(this.multiple() ? [] : null);
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Template handlers
    // -----------------------------------------------------------------------------------------------------
    onFocusIn() {
        this._focused.set(true);
    }
    onFocusOut(event) {
        const next = event.relatedTarget;
        const inside = !!next &&
            (this._host.nativeElement.contains(next) || !!this._panel()?.nativeElement.contains(next));
        if (inside)
            return;
        this._focused.set(false);
        this._onTouched();
    }
    /** Keeps focus in the input when the non-input parts of the trigger are pressed. */
    onTriggerMousedown(event) {
        if (event.target !== this._input()?.nativeElement) {
            event.preventDefault();
        }
    }
    onTriggerClick() {
        if (this.$disabled())
            return;
        this._input()?.nativeElement.focus();
        this.setOpen(this.searchable() ? true : !this.open());
    }
    /**
     * A non-searchable select keeps its input empty. (A method, not an inline `cond && preventDefault()`
     * expression: Angular calls preventDefault() on any listener that returns `false`.)
     */
    onTriggerBeforeInput(event) {
        if (!this.searchable())
            event.preventDefault();
    }
    onTriggerKeydown(event) {
        // aria only opens an editable (input) combobox with ArrowDown; a plain select also opens on Enter/Space
        if (!this.searchable() && !this.open() && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            this.setOpen(true);
            return;
        }
        if (event.key === 'Backspace' && this.multiple() && !this.searchTerm() && this.hasValue()) {
            this.removeValue(this.selectedValues()[this.selectedValues().length - 1]);
        }
    }
    onListboxChange(next) {
        const current = this.selectedValues();
        // aria only knows the rendered rows and drops selected values that aren't among them
        // (filtered out by the term, or swapped away by server search)
        const isRendered = (v) => this.visibleOptions().some((o) => this._eq(o.value(), v));
        if (this.multiple()) {
            const added = next.filter((n) => !current.some((v) => this._eq(v, n)));
            const removedByUser = current.some((v) => isRendered(v) && !next.some((n) => this._eq(n, v)));
            // Pure pruning (nothing added, nothing rendered removed) is not a user change
            if (!added.length && !removedByUser)
                return;
            const kept = current.filter((v) => next.some((n) => this._eq(n, v)) || !isRendered(v));
            this._remember(added);
            this._commit([...kept, ...added]);
            this._resetSearch();
            return;
        }
        const picked = next.find((n) => !current.some((v) => this._eq(v, n)));
        if (picked !== undefined) {
            this._remember([picked]);
            this._commit(picked);
            this.setOpen(false);
            return;
        }
        // Empty result: either the user re-picked the selected (rendered) option, which aria toggles
        // off in explicit single mode, or aria pruned a value that isn't rendered. Keep the value;
        // only a real re-pick closes the panel.
        if (current.some(isRendered))
            this.setOpen(false);
    }
    removeValue(value) {
        this._commit(this.selectedValues().filter((v) => !this._eq(v, value)));
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------
    _remember(values) {
        for (const value of values) {
            const option = this.options().find((o) => this._eq(o.value(), value));
            if (option)
                this._labels.set(value, option.label());
        }
    }
    _commit(value) {
        this.value.set(value);
        this._onChange(value);
    }
    _updateInvalid() {
        const ngControl = this._ngControl;
        this._invalid.set(!!ngControl?.invalid && !!(ngControl.touched || ngControl.dirty));
    }
    _eq(a, b) {
        return this.compareWith()(a, b);
    }
    _resetSearch() {
        this.searchTerm.set('');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiSelectComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "22.0.5", type: UiSelectComponent, isStandalone: true, selector: "ui-select", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, placeholder: { classPropertyName: "placeholder", publicName: "placeholder", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, appearance: { classPropertyName: "appearance", publicName: "appearance", isSignal: true, isRequired: false, transformFunction: null }, searchable: { classPropertyName: "searchable", publicName: "searchable", isSignal: true, isRequired: false, transformFunction: null }, filterFn: { classPropertyName: "filterFn", publicName: "filterFn", isSignal: true, isRequired: false, transformFunction: null }, searchDebounce: { classPropertyName: "searchDebounce", publicName: "searchDebounce", isSignal: true, isRequired: false, transformFunction: null }, serverSearch: { classPropertyName: "serverSearch", publicName: "serverSearch", isSignal: true, isRequired: false, transformFunction: null }, loading: { classPropertyName: "loading", publicName: "loading", isSignal: true, isRequired: false, transformFunction: null }, multiple: { classPropertyName: "multiple", publicName: "multiple", isSignal: true, isRequired: false, transformFunction: null }, compareWith: { classPropertyName: "compareWith", publicName: "compareWith", isSignal: true, isRequired: false, transformFunction: null }, maxTagCount: { classPropertyName: "maxTagCount", publicName: "maxTagCount", isSignal: true, isRequired: false, transformFunction: null }, allowClear: { classPropertyName: "allowClear", publicName: "allowClear", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange", search: "search", openedChange: "openedChange" }, host: { listeners: { "focusin": "onFocusIn()", "focusout": "onFocusOut($event)" }, classAttribute: "block" }, providers: [
            { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiSelectComponent), multi: true },
            { provide: UiFormFieldControl, useExisting: forwardRef(() => UiSelectComponent) },
            { provide: UI_SELECT, useExisting: forwardRef(() => UiSelectComponent) },
        ], queries: [{ propertyName: "options", predicate: UiOptionComponent, isSignal: true }, { propertyName: "emptyTemplate", first: true, predicate: UiSelectEmptyDirective, descendants: true, isSignal: true }], viewQueries: [{ propertyName: "_input", first: true, predicate: ["trigger"], descendants: true, isSignal: true }, { propertyName: "_panel", first: true, predicate: ["panel"], descendants: true, isSignal: true }], usesInheritance: true, ngImport: i0, template: "<!-- Pointer convenience only: keyboard users focus the inner combobox input -->\n<!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus, @angular-eslint/template/click-events-have-key-events -->\n<div\n  cdkOverlayOrigin\n  #origin=\"cdkOverlayOrigin\"\n  [class]=\"triggerClass()\"\n  (mousedown)=\"onTriggerMousedown($event)\"\n  (click)=\"onTriggerClick()\"\n>\n  @if (multiple()) {\n    @for (tag of visibleTags(); track $index) {\n      <span class=\"tag tag-sm\">\n        {{ tag.label }}\n        <button\n          type=\"button\"\n          class=\"tag-remove\"\n          tabindex=\"-1\"\n          [disabled]=\"$disabled()\"\n          [attr.aria-label]=\"'Remove ' + tag.label\"\n          (click)=\"$event.stopPropagation(); removeValue(tag.value)\"\n        >\n          \u00D7\n        </button>\n      </span>\n    }\n    @if (hiddenTagCount() > 0) {\n      <span class=\"tag tag-sm\">+{{ hiddenTagCount() }}</span>\n    }\n  } @else if (hasValue() && !searchTerm()) {\n    <span class=\"select-value\">{{ selectedLabel() }}</span>\n  }\n\n  <input\n    #trigger\n    ngCombobox\n    #combobox=\"ngCombobox\"\n    autocomplete=\"off\"\n    [id]=\"id\"\n    [(value)]=\"searchTerm\"\n    [(expanded)]=\"open\"\n    [disabled]=\"$disabled()\"\n    [softDisabled]=\"false\"\n    [attr.aria-invalid]=\"$invalid() || null\"\n    [attr.placeholder]=\"showPlaceholder() ? placeholder() : null\"\n    [attr.data-readonly]=\"searchable() ? null : ''\"\n    (beforeinput)=\"onTriggerBeforeInput($event)\"\n    (keydown)=\"onTriggerKeydown($event)\"\n  />\n\n  @if (showClear()) {\n    <button\n      type=\"button\"\n      class=\"select-clear\"\n      tabindex=\"-1\"\n      aria-label=\"Clear\"\n      (click)=\"$event.stopPropagation(); clear()\"\n    >\n      \u00D7\n    </button>\n  }\n\n  <span\n    class=\"select-arrow\"\n    aria-hidden=\"true\"\n  ></span>\n</div>\n\n<ng-template\n  ngComboboxPopup\n  [combobox]=\"combobox\"\n>\n  <ng-template\n    cdkConnectedOverlay\n    cdkConnectedOverlayUsePopover=\"inline\"\n    [cdkConnectedOverlayOrigin]=\"origin\"\n    [cdkConnectedOverlayOpen]=\"true\"\n    [cdkConnectedOverlayPositions]=\"positions\"\n    [cdkConnectedOverlayMatchWidth]=\"true\"\n  >\n    <div\n      #panel\n      class=\"select-panel\"\n      ngComboboxWidget\n      ngListbox\n      #listbox=\"ngListbox\"\n      focusMode=\"activedescendant\"\n      selectionMode=\"explicit\"\n      [multi]=\"multiple()\"\n      [softDisabled]=\"false\"\n      [value]=\"listboxValue()\"\n      [activeDescendant]=\"listbox.activeDescendant()\"\n      (valueChange)=\"onListboxChange($event)\"\n      (mousedown)=\"$event.preventDefault()\"\n    >\n      @if (loading()) {\n        <div\n          class=\"select-loading\"\n          role=\"status\"\n        >\n          Loading\u2026\n        </div>\n      } @else {\n        @for (opt of visibleOptions(); track opt) {\n          <div\n            class=\"select-option\"\n            ngOption\n            [value]=\"opt.value()\"\n            [label]=\"opt.label()\"\n            [disabled]=\"opt.disabled()\"\n          >\n            @if (opt.hasContent()) {\n              <ng-container [ngTemplateOutlet]=\"opt.content()\" />\n            } @else {\n              <span [uiHighlight]=\"opt.label()\"></span>\n            }\n          </div>\n        } @empty {\n          <div class=\"select-empty\">\n            @if (emptyTemplate(); as empty) {\n              <ng-container\n                [ngTemplateOutlet]=\"empty.template\"\n                [ngTemplateOutletContext]=\"{ $implicit: searchTerm() }\"\n              />\n            } @else {\n              {{ emptyText() }}\n            }\n          </div>\n        }\n      }\n    </div>\n  </ng-template>\n</ng-template>\n", dependencies: [{ kind: "directive", type: Combobox, selector: "[ngCombobox]", inputs: ["disabled", "softDisabled", "alwaysExpanded", "tabindex", "expanded", "value", "inlineSuggestion"], outputs: ["expandedChange", "valueChange"], exportAs: ["ngCombobox"] }, { kind: "directive", type: ComboboxPopup, selector: "ng-template[ngComboboxPopup]", inputs: ["combobox", "popupType"], exportAs: ["ngComboboxPopup"] }, { kind: "directive", type: ComboboxWidget, selector: "[ngComboboxWidget]", inputs: ["activeDescendant"], exportAs: ["ngComboboxWidget"] }, { kind: "directive", type: Listbox, selector: "[ngListbox]", inputs: ["id", "orientation", "multi", "wrap", "softDisabled", "focusMode", "selectionMode", "typeaheadDelay", "disabled", "readonly", "tabindex", "value"], outputs: ["valueChange"], exportAs: ["ngListbox"] }, { kind: "directive", type: Option, selector: "[ngOption]", inputs: ["id", "value", "disabled", "label"], exportAs: ["ngOption"] }, { kind: "directive", type: CdkOverlayOrigin, selector: "[cdk-overlay-origin], [overlay-origin], [cdkOverlayOrigin]", exportAs: ["cdkOverlayOrigin"] }, { kind: "directive", type: CdkConnectedOverlay, selector: "[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]", inputs: ["cdkConnectedOverlayOrigin", "cdkConnectedOverlayPositions", "cdkConnectedOverlayPositionStrategy", "cdkConnectedOverlayOffsetX", "cdkConnectedOverlayOffsetY", "cdkConnectedOverlayWidth", "cdkConnectedOverlayHeight", "cdkConnectedOverlayMinWidth", "cdkConnectedOverlayMinHeight", "cdkConnectedOverlayBackdropClass", "cdkConnectedOverlayPanelClass", "cdkConnectedOverlayViewportMargin", "cdkConnectedOverlayScrollStrategy", "cdkConnectedOverlayOpen", "cdkConnectedOverlayDisableClose", "cdkConnectedOverlayTransformOriginOn", "cdkConnectedOverlayHasBackdrop", "cdkConnectedOverlayLockPosition", "cdkConnectedOverlayFlexibleDimensions", "cdkConnectedOverlayGrowAfterOpen", "cdkConnectedOverlayPush", "cdkConnectedOverlayDisposeOnNavigation", "cdkConnectedOverlayUsePopover", "cdkConnectedOverlayMatchWidth", "cdkConnectedOverlay"], outputs: ["backdropClick", "positionChange", "attach", "detach", "overlayKeydown", "overlayOutsideClick"], exportAs: ["cdkConnectedOverlay"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: UiHighlightDirective, selector: "[uiHighlight]", inputs: ["uiHighlight", "uiHighlightTerm"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: UiSelectComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ui-select', imports: [
                        Combobox,
                        ComboboxPopup,
                        ComboboxWidget,
                        Listbox,
                        Option,
                        CdkOverlayOrigin,
                        CdkConnectedOverlay,
                        NgTemplateOutlet,
                        UiHighlightDirective,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, providers: [
                        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiSelectComponent), multi: true },
                        { provide: UiFormFieldControl, useExisting: forwardRef(() => UiSelectComponent) },
                        { provide: UI_SELECT, useExisting: forwardRef(() => UiSelectComponent) },
                    ], host: {
                        class: 'block',
                        '(focusin)': 'onFocusIn()',
                        '(focusout)': 'onFocusOut($event)',
                    }, template: "<!-- Pointer convenience only: keyboard users focus the inner combobox input -->\n<!-- eslint-disable-next-line @angular-eslint/template/interactive-supports-focus, @angular-eslint/template/click-events-have-key-events -->\n<div\n  cdkOverlayOrigin\n  #origin=\"cdkOverlayOrigin\"\n  [class]=\"triggerClass()\"\n  (mousedown)=\"onTriggerMousedown($event)\"\n  (click)=\"onTriggerClick()\"\n>\n  @if (multiple()) {\n    @for (tag of visibleTags(); track $index) {\n      <span class=\"tag tag-sm\">\n        {{ tag.label }}\n        <button\n          type=\"button\"\n          class=\"tag-remove\"\n          tabindex=\"-1\"\n          [disabled]=\"$disabled()\"\n          [attr.aria-label]=\"'Remove ' + tag.label\"\n          (click)=\"$event.stopPropagation(); removeValue(tag.value)\"\n        >\n          \u00D7\n        </button>\n      </span>\n    }\n    @if (hiddenTagCount() > 0) {\n      <span class=\"tag tag-sm\">+{{ hiddenTagCount() }}</span>\n    }\n  } @else if (hasValue() && !searchTerm()) {\n    <span class=\"select-value\">{{ selectedLabel() }}</span>\n  }\n\n  <input\n    #trigger\n    ngCombobox\n    #combobox=\"ngCombobox\"\n    autocomplete=\"off\"\n    [id]=\"id\"\n    [(value)]=\"searchTerm\"\n    [(expanded)]=\"open\"\n    [disabled]=\"$disabled()\"\n    [softDisabled]=\"false\"\n    [attr.aria-invalid]=\"$invalid() || null\"\n    [attr.placeholder]=\"showPlaceholder() ? placeholder() : null\"\n    [attr.data-readonly]=\"searchable() ? null : ''\"\n    (beforeinput)=\"onTriggerBeforeInput($event)\"\n    (keydown)=\"onTriggerKeydown($event)\"\n  />\n\n  @if (showClear()) {\n    <button\n      type=\"button\"\n      class=\"select-clear\"\n      tabindex=\"-1\"\n      aria-label=\"Clear\"\n      (click)=\"$event.stopPropagation(); clear()\"\n    >\n      \u00D7\n    </button>\n  }\n\n  <span\n    class=\"select-arrow\"\n    aria-hidden=\"true\"\n  ></span>\n</div>\n\n<ng-template\n  ngComboboxPopup\n  [combobox]=\"combobox\"\n>\n  <ng-template\n    cdkConnectedOverlay\n    cdkConnectedOverlayUsePopover=\"inline\"\n    [cdkConnectedOverlayOrigin]=\"origin\"\n    [cdkConnectedOverlayOpen]=\"true\"\n    [cdkConnectedOverlayPositions]=\"positions\"\n    [cdkConnectedOverlayMatchWidth]=\"true\"\n  >\n    <div\n      #panel\n      class=\"select-panel\"\n      ngComboboxWidget\n      ngListbox\n      #listbox=\"ngListbox\"\n      focusMode=\"activedescendant\"\n      selectionMode=\"explicit\"\n      [multi]=\"multiple()\"\n      [softDisabled]=\"false\"\n      [value]=\"listboxValue()\"\n      [activeDescendant]=\"listbox.activeDescendant()\"\n      (valueChange)=\"onListboxChange($event)\"\n      (mousedown)=\"$event.preventDefault()\"\n    >\n      @if (loading()) {\n        <div\n          class=\"select-loading\"\n          role=\"status\"\n        >\n          Loading\u2026\n        </div>\n      } @else {\n        @for (opt of visibleOptions(); track opt) {\n          <div\n            class=\"select-option\"\n            ngOption\n            [value]=\"opt.value()\"\n            [label]=\"opt.label()\"\n            [disabled]=\"opt.disabled()\"\n          >\n            @if (opt.hasContent()) {\n              <ng-container [ngTemplateOutlet]=\"opt.content()\" />\n            } @else {\n              <span [uiHighlight]=\"opt.label()\"></span>\n            }\n          </div>\n        } @empty {\n          <div class=\"select-empty\">\n            @if (emptyTemplate(); as empty) {\n              <ng-container\n                [ngTemplateOutlet]=\"empty.template\"\n                [ngTemplateOutletContext]=\"{ $implicit: searchTerm() }\"\n              />\n            } @else {\n              {{ emptyText() }}\n            }\n          </div>\n        }\n      }\n    </div>\n  </ng-template>\n</ng-template>\n" }]
        }], ctorParameters: () => [], propDecorators: { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], placeholder: [{ type: i0.Input, args: [{ isSignal: true, alias: "placeholder", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], appearance: [{ type: i0.Input, args: [{ isSignal: true, alias: "appearance", required: false }] }], searchable: [{ type: i0.Input, args: [{ isSignal: true, alias: "searchable", required: false }] }], filterFn: [{ type: i0.Input, args: [{ isSignal: true, alias: "filterFn", required: false }] }], searchDebounce: [{ type: i0.Input, args: [{ isSignal: true, alias: "searchDebounce", required: false }] }], serverSearch: [{ type: i0.Input, args: [{ isSignal: true, alias: "serverSearch", required: false }] }], loading: [{ type: i0.Input, args: [{ isSignal: true, alias: "loading", required: false }] }], multiple: [{ type: i0.Input, args: [{ isSignal: true, alias: "multiple", required: false }] }], compareWith: [{ type: i0.Input, args: [{ isSignal: true, alias: "compareWith", required: false }] }], maxTagCount: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxTagCount", required: false }] }], allowClear: [{ type: i0.Input, args: [{ isSignal: true, alias: "allowClear", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], search: [{ type: i0.Output, args: ["search"] }], openedChange: [{ type: i0.Output, args: ["openedChange"] }], options: [{ type: i0.ContentChildren, args: [i0.forwardRef(() => UiOptionComponent), { isSignal: true }] }], emptyTemplate: [{ type: i0.ContentChild, args: [i0.forwardRef(() => UiSelectEmptyDirective), { isSignal: true }] }], _input: [{ type: i0.ViewChild, args: ['trigger', { isSignal: true }] }], _panel: [{ type: i0.ViewChild, args: ['panel', { isSignal: true }] }] } });

/**
 * Generated bundle index. Do not edit.
 */

export { UI_SELECT, UiHighlightDirective, UiOptionComponent, UiSelectComponent, UiSelectEmptyDirective, uiDefaultFilter };
//# sourceMappingURL=libs-ui-select.mjs.map
