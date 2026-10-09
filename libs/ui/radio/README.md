# Radio Group

A group of radio buttons (`role="radio"` elements with roving focus) that act as one control: one value, arrow keys to move, `Tab` to enter and leave. Works with `formControl`, `ngModel` and a two-way `[(value)]`. The group is `role="radiogroup"`: name it with `aria-label` or `aria-labelledby` (or a `ui-form-field` label).

```ts
import { UiRadioModule } from '@libs/ui/radio';
```

`UiRadioModule` brings `ui-radio-group` and `ui-radio`: add it to a component's `imports`. The parts are standalone, so you can also import them one by one.

## Usage

```html
<ui-radio-group [(value)]="plan" aria-label="Plan">
  <ui-radio value="starter" label="Starter" />
  <ui-radio value="team" label="Team" />
  <ui-radio value="enterprise" label="Enterprise" [disabled]="true" />
</ui-radio-group>

<!-- Reactive forms, any value type -->
<ui-radio-group [formControl]="shipping" size="lg">
  <ui-radio [value]="{ id: 1 }" label="Standard" />
  <ui-radio [value]="{ id: 2 }" label="Express" />
</ui-radio-group>
```

## API

### `ui-radio-group`

| Input      | Type                                   | Default | Description                                                                                                                         |
| ---------- | -------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `value`    | `any` (`model`)                        | `null`  | The value of the selected radio. Two-way: `[(value)]`.                                                                              |
| `name`     | `string`                               | auto    | Identifier of the group. The radios are `role="radio"` elements, not native inputs, so it does not take part in a native form post. |
| `disabled` | `boolean`                              | `false` | Disables every radio (also set by the form).                                                                                        |
| `size`     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`  | Size of the radios.                                                                                                                 |

### `ui-radio`

| Input      | Type      | Default  | Description                             |
| ---------- | --------- | -------- | --------------------------------------- |
| `value`    | `any`     | required | What the group holds when it is picked. |
| `label`    | `string`  | –        | Text beside the radio.                  |
| `disabled` | `boolean` | `false`  | This radio cannot be picked.            |

Methods: `select()` and `focus()` on a radio.
