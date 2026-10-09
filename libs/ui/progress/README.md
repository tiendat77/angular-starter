# Progress & Spinner

`ui-progress-bar` is a linear progress indicator and `ui-spinner` a circular one. Give them a `value` for a determinate state; leave `value` as `null` and they animate as indeterminate. Both expose `role="progressbar"` with the right `aria-*` values.

```ts
import { UiProgressBarComponent, UiSpinnerComponent } from '@libs/ui/progress';
```

## Usage

```html
<ui-progress-bar [value]="uploaded()" label="Upload" />   <!-- 0-100 -->
<ui-progress-bar />                                       <!-- indeterminate -->
<ui-progress-bar [value]="3" [max]="5" color="success" size="lg" />

<ui-spinner />                                            <!-- rotating arc, 1em, current text colour -->
<ui-spinner size="lg" color="primary" label="Saving" />
<ui-spinner [value]="60" showValue color="success" />     <!-- ring filled to 60% with "60%" inside -->
```

A `ui-spinner` follows the text size and colour it sits in, so it fits inside a button or a sentence.

## API

### `ui-progress-bar`

| Input   | Type                                                                    | Default      | Description                        |
| ------- | ----------------------------------------------------------------------- | ------------ | ---------------------------------- |
| `value` | `number \| null`                                                        | `null`       | Progress; `null` is indeterminate. |
| `max`   | `number`                                                                | `100`        | The value that means "done".       |
| `size`  | `'sm' \| 'md' \| 'lg'`                                                  | `'md'`       | Thickness.                         |
| `color` | `'neutral' \| 'primary' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'primary'`  | Colour.                            |
| `label` | `string`                                                                | `'Progress'` | Accessible name.                   |

### `ui-spinner`

| Input         | Type                                                                                 | Default     | Description                                                 |
| ------------- | ------------------------------------------------------------------------------------ | ----------- | ----------------------------------------------------------- |
| `value`       | `number \| null`                                                                     | `null`      | Determinate ring (`value / max`); `null` is a rotating arc. |
| `max`         | `number`                                                                             | `100`       | The value that means "done".                                |
| `size`        | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'inherit'`                                  | `'inherit'` | `inherit` follows the font size (`1em`).                    |
| `strokeWidth` | `number \| null`                                                                     | `null`      | Width of the ring (default from the size).                  |
| `color`       | `'current' \| 'neutral' \| 'primary' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'current'` | `current` follows the text colour.                          |
| `showValue`   | `boolean`                                                                            | `false`     | Shows the value inside a determinate ring.                  |
| `label`       | `string`                                                                             | `'Loading'` | Accessible name.                                            |
