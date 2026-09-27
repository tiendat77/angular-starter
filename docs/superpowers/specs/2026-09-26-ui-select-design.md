# `ui-select` — Select & Multi-select Design

_Status: approved in brainstorming, awaiting spec review · 2026-09-26_
_Roadmap: Phase 1 "Select (single)" and "Multi-select" (`docs/ui-roadmap-status.md` §4)_

---

## 1. Goal

Add a `ui-select` component to `@libs/ui` that covers single and multiple selection. It must support:

- inline search typed directly in the trigger (ng-zorro style), with an empty state when nothing matches
- a customizable search function
- highlighting of the matched text inside options

Behavior and accessibility come from **`@angular/aria`** (Combobox + Listbox). Positioning comes from the **CDK connected overlay**. The look comes from the library's shared CSS utilities.

### Decisions made during brainstorming

| Topic | Decision |
|---|---|
| How options are supplied | Child `<ui-option [value] [label]>` elements (Material style), with optional custom content |
| Search customization | Default label match, overridable with `[filterFn]`; or `serverSearch`, where the select emits `(search)` and the consumer swaps options |
| Multiple-mode trigger | Removable tags, `maxTagCount` "+N", Backspace removes the last tag |
| v1 extras | Clear button (`allowClear`), disabled options |
| Deferred to v2 | Virtual scroll (internals stay index-based so it can be added without API changes) |
| Out of v1 | Option groups, creating values from search text, Ctrl+A select-all, prefix/suffix inside `ui-form-field` |
| Behavior engine | `@angular/aria` Combobox + Listbox (not Material's key manager) |

---

## 2. Architecture

### 2.1 Key idea: `<ui-option>` declares, `<ui-select>` renders

`@angular/aria`'s `ngOption` injects its `ngListbox` through DI (`inject(LISTBOX)`), so an `ngOption` must be created inside the listbox's own view. A `<ui-option>` written by the consumer inside `<ui-select>` is created in the consumer's template, outside the panel.

Therefore:

- **`UiOption`** is a declaration with no rendered DOM of its own. It exposes signal inputs `value`, `label`, `disabled`, and its projected content captured as a template (`<ng-template><ng-content /></ng-template>` read with `viewChild(TemplateRef)`).
- **`UiSelect`** reads the declarations with `contentChildren(UiOption)` and renders the real rows, each with `ngOption`, inside its listbox. It renders the option's content template if it has one, otherwise the label with highlighting.

### 2.2 Template outline

```html
<!-- trigger -->
<div class="input …" cdkOverlayOrigin #origin="cdkOverlayOrigin">
  @for (tag of visibleTags(); track tag.key) {
    <span class="tag">{{ tag.label }} <button class="tag-remove" (click)="remove(tag)">×</button></span>
  }
  @if (hiddenTagCount()) { <span class="tag">+{{ hiddenTagCount() }}</span> }

  <input ngCombobox #combobox="ngCombobox"
         [id]="id" [(value)]="searchTerm" [(expanded)]="open"
         [disabled]="$disabled()" [readonly]="!searchable()" />

  @if (showClear()) { <button class="select-clear" (click)="clear()">×</button> }
  <span class="select-arrow" aria-hidden="true"></span>
</div>

<!-- popup: aria deferred content, positioned by the CDK overlay -->
<ng-template ngComboboxPopup [combobox]="combobox">
  <ng-template cdkConnectedOverlay
               [cdkConnectedOverlayOrigin]="origin"
               [cdkConnectedOverlayOpen]="true"
               [cdkConnectedOverlayWidth]="originWidth()"
               [cdkConnectedOverlayPositions]="positions"
               (overlayOutsideClick)="close()">
    <div class="select-panel"
         ngComboboxWidget ngListbox #listbox="ngListbox"
         [multi]="multiple()" focusMode="activedescendant" selectionMode="explicit"
         [value]="listboxValue()" (valueChange)="onListboxChange($event)"
         [activeDescendant]="listbox.activeDescendant()">
      @if (loading()) {
        <div class="select-loading">…</div>
      } @else {
        @for (opt of visibleOptions(); track opt) {
          <div class="select-option" ngOption
               [value]="opt.value()" [label]="opt.label()" [disabled]="opt.disabled()">
            @if (opt.content()) { <ng-container *ngTemplateOutlet="opt.content()" /> }
            @else { <span [uiHighlight]="opt.label()"></span> }
          </div>
        } @empty {
          <div class="select-empty">…empty template or default text…</div>
        }
      }
    </div>
  </ng-template>
</ng-template>
```

The exact bindings are validated by the spike in §9, step 1. The structure is what's fixed here.

### 2.3 Responsibilities

| Part | Owns |
|---|---|
| `@angular/aria` (`ngCombobox`, `ngComboboxPopup`, `ngComboboxWidget`, `ngListbox`, `ngOption`) | ARIA roles/states, expanded state, active descendant, arrow/Home/End/Enter/Escape handling, single vs multi selection, disabled-option skipping |
| CDK Overlay | Positioning, flipping, matching the trigger width, outside click, repositioning on scroll |
| `UiSelect` | Search term, filtering (`visibleOptions`), `(search)` debounce, tags + Backspace, clear, selected-label cache, `compareWith` mapping, `ControlValueAccessor`, `UiFormFieldControl` |
| `UiOption` | Declaring `value` / `label` / `disabled` / content template |
| `UiHighlight` | Rendering a label with the current term wrapped in `<mark>` |

### 2.4 Values and `compareWith`

The consumer's value (`T`, or `T[]` in multiple mode) is the source of truth. `listboxValue` is computed by mapping each selected value to the matching option's value via `compareWith`, so aria sees the exact references it rendered. `onListboxChange` maps back, and it keeps selected values whose options aren't currently visible (filtered out, or swapped away by server search).

---

## 3. Public API

Entry point: **`@libs/ui/select`**. Also re-exported from `@libs/ui`.

### 3.1 Usage

```html
<!-- single, searchable, in a form field -->
<ui-form-field>
  <label uiLabel>Owner</label>
  <ui-select [formControl]="owner" searchable allowClear placeholder="Pick a user">
    @for (u of users; track u.id) {
      <ui-option [value]="u.id" [label]="u.name" [disabled]="!u.active" />
    }
    <ng-template uiSelectEmpty let-term>No user matches "{{ term }}"</ng-template>
  </ui-select>
</ui-form-field>

<!-- multiple, server search, custom option content -->
<ui-select [(value)]="assignees" multiple searchable serverSearch
           [loading]="loading()" [maxTagCount]="3" (search)="query($event)">
  @for (u of results(); track u.id) {
    <ui-option [value]="u" [label]="u.name">
      <img [src]="u.avatar" class="size-5 rounded-full" />
      <span [uiHighlight]="u.name"></span>
    </ui-option>
  }
</ui-select>
```

### 3.2 `UiSelect<T>` — `ui-select`

| Member | Type | Default | Purpose |
|---|---|---|---|
| `value` | `model<T \| T[] \| null>` | `null` | Selected value; an array in multiple mode |
| `multiple` | `boolean` | `false` | Tags + multi selection; the panel stays open after each pick |
| `searchable` | `boolean` | `false` | Typing in the trigger filters the options |
| `filterFn` | `UiSelectFilterFn<T>` | `uiDefaultFilter` | Client-side matching |
| `serverSearch` | `boolean` | `false` | Disables client filtering; the consumer supplies matching options |
| `searchDebounce` | `number` (ms) | `300` | Debounce for `(search)` |
| `loading` | `boolean` | `false` | Shows the loading row instead of the list |
| `compareWith` | `(a: T, b: T) => boolean` | `(a, b) => a === b` | Value equality |
| `placeholder` | `string` | `''` | Shown when there is no value |
| `allowClear` | `boolean` | `false` | Shows a clear button when there is a value |
| `maxTagCount` | `number \| null` | `null` (unlimited) | Extra tags collapse into "+N" |
| `disabled` | `boolean` | `false` | Combined with the forms disabled state |
| `size` | `UiSize` | `UI_CONFIG.defaultSize` ?? `'md'` | Same scale as `uiInput` |
| `appearance` | `UiFormFieldAppearance` | `UI_CONFIG.formField.appearance` ?? `'outline'` | `outline` \| `filled` |
| `(search)` | `EventEmitter<string>` | | Debounced term; emitted whenever `searchable` is on, not only in server mode |
| `(openedChange)` | `EventEmitter<boolean>` | | Panel opened / closed |

Provides: `NG_VALUE_ACCESSOR`, `UiFormFieldControl`, `UI_SELECT` (context for `UiOption` and `UiHighlight`).

### 3.3 `UiOption<T>` — `ui-option`

| Input | Type | Notes |
|---|---|---|
| `value` | `T` (required) | |
| `label` | `string` (required) | Used for search, highlighting, tags, the single display and the label cache |
| `disabled` | `boolean` | Default `false` |

Content is optional. Without it, the select renders the label with the match highlighted.

### 3.4 `UiHighlight` — `[uiHighlight]`

- `[uiHighlight]="text"` renders `text` with every match of the current term wrapped in `<mark>`. The term comes from the nearest `UI_SELECT`.
- `[uiHighlightTerm]` overrides the term, which makes it usable outside a select.
- Rendering uses text nodes and `<mark>` elements, never `innerHTML`.

### 3.5 `UiSelectEmpty` — `ng-template[uiSelectEmpty]`

Custom empty-state content. The context `$implicit` is the current term. The default content is `No results for "{term}"`, or `No options` when the term is empty.

### 3.6 Exported helpers

```ts
export interface UiSelectOptionRef<T> {
  readonly value: T;
  readonly label: string;
  readonly disabled: boolean;
}

export type UiSelectFilterFn<T> = (term: string, option: UiSelectOptionRef<T>) => boolean;

/** Case- and accent-insensitive "label contains term" (e.g. "nguyen" matches "Nguyễn"). */
export const uiDefaultFilter: UiSelectFilterFn<unknown>;
```

---

## 4. Behavior

### 4.1 Opening and closing

- **Opens on:** a click on the trigger; ↓ / Enter / Space when not searchable; typing when searchable.
- **Closes on:** Escape, Tab, or an outside click (overlay `overlayOutsideClick`).
- **Single mode:** selecting an option closes the panel and clears the term.
- **Multiple mode:** the panel stays open after each pick, and the term is cleared.
- On open, the active option is the selected one (single mode) or the first enabled visible option.
- `(openedChange)` fires on every transition.

### 4.2 Search

```
input text → searchTerm (signal)
  ├─ client mode:  visibleOptions = options().filter(o => filterFn(term, o))
  └─ serverSearch: visibleOptions = options()
searchTerm → debounce(searchDebounce) → (search)
visibleOptions change → active option moves to the first enabled visible option
```

- An empty term shows all options.
- Filtering never changes the value.
- The panel shows exactly one of these, in order:
  1. **loading**, when `loading` is true
  2. **options**, when there are visible options
  3. **empty**, otherwise

### 4.3 Trigger display

| | Not searchable | Searchable |
|---|---|---|
| Single | Selected label, or the placeholder | Selected label shown faded behind the input while the term is empty; typing shows the term. On close without a pick, the term clears and the label returns |
| Multiple | Tags (+N), or the placeholder | Tags (+N), then the inline input |

### 4.4 Tags (multiple mode)

- Tags are shown in selection order.
- A tag's × removes that value without opening the panel.
- Backspace in an empty search input removes the last value.
- With `maxTagCount = n`, the first `n` tags render, followed by a non-interactive "+(count − n)" tag.

### 4.5 Selected-label cache

- A small map keyed through `compareWith`: value → label.
- It is filled when an option is selected, and whenever `options()` changes and contains values matching the current value.
- Tags and the single display always read labels from the cache. A value whose option has disappeared (server search) keeps its label.
- A value with no known label yet is kept, and renders nothing until a matching option registers.

### 4.6 Clear

- The clear button appears when `allowClear` is on, the select isn't disabled, and there is a value.
- It sets the value to `null` (single) or `[]` (multiple), emits the change, and doesn't open the panel.

### 4.7 Disabled

- **Disabled options:** rendered faded, skipped by keyboard navigation, not selectable. Values already selected remain selected, and their tags stay removable.
- **Disabled select (input or forms):** the trigger input, tag × buttons and the clear button are all disabled, and the panel can't open.

### 4.8 Forms

- `writeValue` sets the value without emitting a change.
- Each user selection calls `onChange`.
- `onTouched` fires when focus leaves the component entirely: the trigger and the overlay panel.
- `setDisabledState` behaves as in §4.7.
- `UiFormFieldControl`:
  - `$value`, `$disabled` and `$focused` come from signals.
  - `$invalid` uses the same `NgControl.events` subscription pattern as `UiInputDirective`: invalid, and touched or dirty.
  - `id` is the trigger input's id, so the form field's label `for`, `aria-describedby` and `aria-invalid` target the input.

---

## 5. Styling

Follows the library convention: the look lives in `@utility` CSS, and components only choose class names.

- **Trigger:** the existing `input` utility in wrapper mode, plus `input-{size}` and `input-filled`. Focus ring, invalid border and disabled look come for free and match `uiInput`.
- **New `libs/ui/styles/components/select.css`:**
  - `select-panel`: surface `--color-background`, border `--color-border`, radius, shadow, `max-height` with scrolling
  - `select-option`: padding and hover; active via `[data-active]`; selected via `[aria-selected='true']`, with a check mark in multiple mode; disabled via `[aria-disabled='true']`
  - `select-empty`, `select-loading` (reusing the button spinner style)
  - `select-arrow`: a chevron that rotates when the trigger has `[aria-expanded='true']`
  - `select-clear`
  - Implementation must confirm which attributes `@angular/aria` sets for the active and selected states (§9, step 1) and use exactly those.
- **New `libs/ui/styles/components/tag.css`:** `tag`, `tag-sm`, `tag-md`, `tag-remove`. Generic, so the roadmap's future Tag component can reuse it.
- **`mark` inside options / `[uiHighlight]`:** transparent background, `font-weight: 600`, `color: var(--color-primary)`. Readable in both themes and follows brand overrides.
- The existing native `select` utility stays unchanged for plain `<select>` elements.

---

## 6. Files

```
libs/ui/select/
  ng-package.json
  src/public-api.ts
  src/select.component.ts           UiSelect
  src/select.component.html
  src/option.component.ts           UiOption
  src/highlight.directive.ts        UiHighlight
  src/select-empty.directive.ts     UiSelectEmpty
  src/select-filter.ts              uiDefaultFilter, normalizeForSearch(), UiSelectFilterFn, UiSelectOptionRef
  src/highlight-segments.ts         splitHighlight(text, term): { text: string; match: boolean }[]
  src/select-label-cache.ts         value → label map using compareWith
  src/select.tokens.ts              UI_SELECT injection token + context interface
  src/*.spec.ts
libs/ui/styles/components/select.css
libs/ui/styles/components/tag.css
libs/ui/styles/index.css            import the two new files
libs/ui/src/public-api.ts           export * from '@libs/ui/select'
projects/docs/src/app/features/select-doc/*   docs page (+ route and sidebar entry under "Forms")
packages/ui                          rebuilt
```

---

## 7. Testing

### Pure units
- `uiDefaultFilter`: case-insensitive, accent-insensitive, empty term matches everything, no match.
- `splitHighlight`:
  - a single match and multiple matches
  - match at the start or end
  - accent-insensitive matching that preserves the original characters in the output
  - special regex characters (`(`, `*`, `.`) treated as plain text
  - empty term returns one non-matching segment
- Label cache: set/get through `compareWith` with object values; missing values.

### Component (host components, jsdom; aria `*/testing` harnesses where useful)
- Opening and closing by click, ↓, Escape, and outside click; `(openedChange)`.
- Keyboard: arrows move the active option, Enter selects, disabled options are skipped.
- Single mode closes after a pick; multiple mode stays open and clears the term.
- Search: client filtering, custom `filterFn` called with `(term, optionRef)`, the empty template receives the term, the default empty text.
- `serverSearch`: options are not filtered; `(search)` is debounced (fake timers); the `loading` row; labels survive the options being replaced.
- Tags: tag × removes, Backspace removes the last value, `maxTagCount` shows "+N".
- `allowClear` resets the value and doesn't open the panel.
- Reactive forms: `writeValue` (no emit), user change emits, `setDisabledState`, touched on blur, `compareWith` with object values.
- Inside `ui-form-field`: label `for` equals the trigger id; `aria-invalid` when invalid and touched.
- Highlight: default rows contain `<mark>` for the matched text; `[uiHighlightTerm]` works standalone.

### Visual
The headless screenshot run used for previous changes: closed and open panel, search with highlight, empty state, tags with +N, loading, disabled; light and dark.

---

## 8. Docs page (`/select`, group "Forms")

- **Playground controls:** multiple, searchable, server search (simulated API with delay), allowClear, maxTagCount, size, appearance, disabled; live generated usage code.
- **Examples:** custom option content with `[uiHighlight]`, a custom `uiSelectEmpty` template, object values with `compareWith`.
- **API tables** for `ui-select`, `ui-option`, `[uiHighlight]`, `uiSelectEmpty`.

---

## 9. Implementation order

1. **Spike (throwaway):** render `ngCombobox` + `ngComboboxPopup` + `cdkConnectedOverlay` + `ngListbox`, with rows rendered by the select from `contentChildren` declarations. Confirm all of:
   - the overlay opens and positions correctly
   - the active descendant reaches the input while the listbox lives in the overlay DOM
   - keyboard navigation and selection work
   - which attributes mark the active and selected states

   Adjust §2.2 bindings if needed before continuing.
2. Pure units: `select-filter`, `highlight-segments`, `select-label-cache`.
3. `UiOption` + a basic single select (non-searchable).
4. Search, empty state, `UiHighlight`, `UiSelectEmpty`.
5. Multiple mode, tags, Backspace, `maxTagCount`.
6. `serverSearch`, `(search)` debounce, `loading`, label cache integration.
7. `allowClear`, disabled states.
8. Forms + `UiFormFieldControl` + form-field integration.
9. `select.css` / `tag.css` and a visual check.
10. Docs page, `@libs/ui` re-export, rebuild `packages/ui`.

---

## 10. Out of scope (v1)

- Virtual scroll (planned for v2 via a `*uiVirtualFor` mode, no public API change for existing usage)
- Option groups
- Creating new values from the search text
- Select-all (Ctrl+A)
- Prefix/suffix for `ui-select` inside `ui-form-field`
- An interactive "+N" tag (for example, a popover listing hidden values)
