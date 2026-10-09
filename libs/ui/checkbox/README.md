# Checkbox & Switch

Form controls for a boolean: `ui-checkbox`, and two switches (`ui-switch` with the label beside the track, `ui-switch-labeled` with the label inside it). All work with `formControl`, `ngModel` and a two-way `[(checked)]`.

```ts
import { UiCheckboxComponent, UiSwitchComponent, UiSwitchLabeledComponent } from '@libs/ui/checkbox';
```

## Usage

```html
<ui-checkbox label="Accept the terms" [formControl]="accepted" />

<!-- Two-way, without a form -->
<ui-checkbox label="Select all" [(checked)]="all" [indeterminate]="some()" />

<!-- No visible label: give it a name -->
<ui-checkbox ariaLabel="Select row 3" [(checked)]="row.selected" />

<ui-switch label="Email notifications" [(checked)]="emails" />
<ui-switch-labeled label="On" size="lg" [formControl]="enabled" />
```

## API

### `ui-checkbox`

| Input           | Type                                   | Default | Description                                                         |
| --------------- | -------------------------------------- | ------- | ------------------------------------------------------------------- |
| `checked`       | `boolean` (`model`)                    | `false` | Two-way: `[(checked)]`.                                             |
| `indeterminate` | `boolean`                              | `false` | The "some selected" state of a parent checkbox.                     |
| `disabled`      | `boolean`                              | `false` | Also set by the form.                                               |
| `size`          | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`  | Size.                                                               |
| `label`         | `string`                               | `''`    | Visible label.                                                      |
| `id`            | `string`                               | auto    | DOM id of the native input.                                         |
| `ariaLabel`     | `string`                               | `''`    | Accessible name when there is no visible label (e.g. a table cell). |

### `ui-switch`, `ui-switch-labeled`

| Input      | Type                                   | Default | Description                            |
| ---------- | -------------------------------------- | ------- | -------------------------------------- |
| `checked`  | `boolean` (`model`)                    | `false` | Two-way: `[(checked)]`.                |
| `disabled` | `boolean`                              | `false` | Also set by the form.                  |
| `size`     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`  | Size.                                  |
| `label`    | `string`                               | `''`    | Label: beside the track, or inside it. |
| `id`       | `string`                               | auto    | DOM id of the native input.            |

`toggle()` flips a switch from code.
