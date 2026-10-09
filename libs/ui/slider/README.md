# Slider & Range Slider

`ui-slider` picks one number; `ui-range-slider` picks a range with two thumbs. Both have ticks, a value bubble, sizes and colours, keyboard control, and work with `formControl`, `ngModel`, a two-way `[(value)]` and inside `ui-form-field`.

```ts
import { UiRangeSlider, UiSlider } from '@libs/ui/slider';
```

## Usage

```html
<ui-slider ariaLabel="Volume" [(value)]="volume" />

<ui-slider
  ariaLabel="Brightness"
  [min]="0" [max]="1" [step]="0.05"
  color="warning" size="lg"
  showTicks [tickStep]="0.25"
  [displayWith]="percent"
  [formControl]="brightness"
/>

<!-- Two thumbs: the value is a [low, high] tuple -->
<ui-range-slider
  ariaLabel="Price"
  [min]="0" [max]="1000" [step]="50" [minGap]="100"
  showValue
  [displayWith]="dollars"
  [(value)]="price"
/>
```

```ts
percent = (v: number) => `${Math.round(v * 100)}%`;
dollars = (v: number) => `$${v}`;
price = signal<[number, number]>([200, 800]);
```

In a form field:

```html
<ui-form-field>
  <label uiLabel for="vol">Volume</label>
  <ui-slider inputId="vol" formControlName="volume" showValue [displayWith]="percent" />
  <span uiHint>At least 10%.</span>
</ui-form-field>
```

**Keyboard** (each thumb): Arrow Right / Up add `step` and Left / Down subtract it (the horizontal arrows swap in right-to-left layouts); Page Up / Down move 10% of the range; Home / End go to the thumb's lower / upper limit. **Pointer:** press the track to jump the nearest thumb there, drag to move it; touch works too. A form value outside the range is shown kept inside it and is not rewritten until the user moves the thumb.

## API

### Both components

| Input            | Type                                                                                   | Default     | Description                                                      |
| ---------------- | -------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------- |
| `min` / `max`    | `number`                                                                               | `0` / `100` | Ends of the track.                                               |
| `step`           | `number`                                                                               | `1`         | Values are multiples of `step` from `min`.                       |
| `disabled`       | `boolean`                                                                              | `false`     | Also set by the form.                                            |
| `size`           | `'xs' \| 'sm' \| 'md' \| 'lg'`                                                         | `'md'`      | Track and thumb size.                                            |
| `color`          | `'neutral' \| 'primary' \| 'secondary' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'primary'` | Colour of the filled part.                                       |
| `showTicks`      | `boolean`                                                                              | `false`     | A tick under the track every `tickStep` (at most 200 are drawn). |
| `tickStep`       | `number`                                                                               | `step`      | Distance between ticks.                                          |
| `displayWith`    | `(value: number) => string`                                                            | –           | Text of a value: the bubble over the thumb and `aria-valuetext`. |
| `showValue`      | `boolean`                                                                              | `false`     | Keeps the bubble visible (otherwise on hover, focus and drag).   |
| `ariaLabel`      | `string`                                                                               | –           | Accessible name.                                                 |
| `ariaLabelledby` | `string`                                                                               | –           | Id of an element that names it (wins over `ariaLabel`).          |
| `inputId`        | `string`                                                                               | auto        | DOM id of the (first) thumb.                                     |

### `ui-slider`

| Input   | Type                       | Default | Description                              |
| ------- | -------------------------- | ------- | ---------------------------------------- |
| `value` | `number \| null` (`model`) | `null`  | Two-way `[(value)]`. `null` shows `min`. |

### `ui-range-slider`

| Input                     | Type                                 | Default                   | Description                                                        |
| ------------------------- | ------------------------------------ | ------------------------- | ------------------------------------------------------------------ |
| `value`                   | `[number, number] \| null` (`model`) | `null`                    | `[low, high]`. `null` shows the whole track.                       |
| `minGap`                  | `number`                             | `0`                       | The least distance between the thumbs. They never cross.           |
| `startLabel` / `endLabel` | `string`                             | `'Minimum'` / `'Maximum'` | Accessible name of the lower / upper thumb (use them to localise). |
