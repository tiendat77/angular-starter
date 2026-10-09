# Select

A select built on `@angular/aria` (combobox and listbox) with a CDK overlay. Single or multiple choice, search (local or from a server), tags, clear button, and on small screens the options open in a bottom sheet with Cancel / Apply. Works with `formControl`, `ngModel`, `[(value)]` and inside `ui-form-field`.

```ts
import { UiSelectModule } from '@libs/ui/select';
```

`UiSelectModule` brings `ui-select`, `ui-option`, the empty template and `uiHighlight`: add it to a component's `imports`. The parts are standalone, so you can also import them one by one.

## Usage

```html
<ui-select [(value)]="country" placeholder="Choose a country" ariaLabel="Country">
  <ui-option value="vn" label="Vietnam" />
  <ui-option value="jp" label="Japan" />
  <ui-option value="fr" label="France" [disabled]="true" />
</ui-select>

<!-- In a form field: several values, searchable, tags capped at 2 -->
<ui-form-field>
  <label uiLabel>Tags</label>
  <ui-select
    [formControl]="tags"
    multiple
    searchable
    allowClear
    [maxTagCount]="2"
    placeholder="Pick tags"
  >
    @for (tag of tagOptions; track tag.id) {
      <ui-option [value]="tag.id" [label]="tag.name" />
    }
  </ui-select>
</ui-form-field>

<!-- Objects as values, and your own "no results" -->
<ui-select [(value)]="user" [compareWith]="sameUser" searchable>
  @for (u of users; track u.id) {
    <ui-option [value]="u" [label]="u.name">
      <img [src]="u.avatar" alt="" /> <span [uiHighlight]="u.name"></span>
    </ui-option>
  }
  <ng-template uiSelectEmpty let-term>No user matches "{{ term }}".</ng-template>
</ui-select>
```

Search on the server: turn on `serverSearch`, load the options yourself on `(searchChange)`, and the select shows them as given.

```html
<ui-select searchable serverSearch [loading]="loading()" (searchChange)="load($event)" [(value)]="city">
  @for (c of cities(); track c.id) { <ui-option [value]="c.id" [label]="c.name" /> }
</ui-select>
```

Translate the mobile sheet: `provideUiSelectI18n({ cancel: 'Hủy', apply: 'Áp dụng', searchPlaceholder: 'Tìm kiếm' })`.

## API

### `ui-select`

| Input              | Type                                   | Default                | Description                                                                              |
| ------------------ | -------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| `value`            | `T \| T[] \| null` (`model`)           | `null`                 | The selected value (an array with `multiple`). Two-way: `[(value)]`.                     |
| `placeholder`      | `string`                               | `''`                   | Shown while nothing is selected.                                                         |
| `multiple`         | `boolean`                              | `false`                | Several values, shown as tags.                                                           |
| `searchable`       | `boolean`                              | `false`                | A search box filters the options.                                                        |
| `filterFn`         | `(term, option) => boolean`            | `uiDefaultFilter`      | Your own matcher for the local search.                                                   |
| `searchDebounce`   | `number`                               | `300`                  | Milliseconds before `searchChange` fires.                                                |
| `serverSearch`     | `boolean`                              | `false`                | You filter (usually remotely, on `searchChange`); the select shows the options as given. |
| `loading`          | `boolean`                              | `false`                | Shows a loading state in the list.                                                       |
| `compareWith`      | `(a: T, b: T) => boolean`              | `a === b`              | How values are compared (for objects).                                                   |
| `maxTagCount`      | `number \| null`                       | `null`                 | Tags shown with `multiple`; the rest become `+N`.                                        |
| `allowClear`       | `boolean`                              | `false`                | A button that clears the value.                                                          |
| `mobileBreakpoint` | `string \| false`                      | `'(max-width: 640px)'` | Media query below which the options open in a bottom sheet. `false`: always a popup.     |
| `size`             | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | the app's default size | Size.                                                                                    |
| `appearance`       | `'outline' \| 'filled'`                | the app's default      | Look.                                                                                    |
| `disabled`         | `boolean`                              | `false`                | Also set by the form.                                                                    |
| `ariaLabel`        | `string \| null`                       | `null`                 | Accessible name when no `ui-form-field` label names it.                                  |
| `ariaLabelledby`   | `string \| null`                       | `null`                 | Id of an element that names it.                                                          |

| Output         | Type      | Description                                      |
| -------------- | --------- | ------------------------------------------------ |
| `searchChange` | `string`  | The (debounced) search term, while `searchable`. |
| `openedChange` | `boolean` | The list opened or closed.                       |

Methods: `setOpen(open)` and `clear()`.

### `ui-option`

| Input      | Type      | Default  | Description                                           |
| ---------- | --------- | -------- | ----------------------------------------------------- |
| `value`    | `T`       | required | The value it stands for.                              |
| `label`    | `string`  | required | Text of the option, of the selection and of the tags. |
| `disabled` | `boolean` | `false`  | Cannot be picked.                                     |

Content inside `<ui-option>` replaces the label in the list.

### Other

| Export                         | Use                                                                       |
| ------------------------------ | ------------------------------------------------------------------------- |
| `ng-template[uiSelectEmpty]`   | Custom "no results"; `let-term` is the search term.                       |
| `[uiHighlight]`                | Marks the search term inside a text (`uiHighlightTerm` to give the term). |
| `provideUiSelectI18n(strings)` | Texts of the mobile sheet: `cancel`, `apply`, `searchPlaceholder`.        |
