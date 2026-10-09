# Input & Form Field

Styled native `<input>` and `<textarea>`, and `ui-form-field`, which lays out a label, a control, a hint and an error and wires the accessibility between them: the label's `for`, the control's `aria-describedby` and its `aria-invalid`. It wraps any `UiFormFieldControl`: the inputs here, and `ui-select`, `ui-otp-input`, `ui-editor`, `ui-slider` and `ui-range-slider`.

```ts
import { UiInputModule } from '@libs/ui/input';
```

`UiInputModule` brings `ui-form-field`, `uiInput`, `uiTextarea` and the label, hint, error, prefix and suffix parts: add it to a component's `imports`. The parts are standalone, so you can also import them one by one.

## Usage

```html
<ui-form-field>
  <label uiLabel>Email</label>
  <input uiInput type="email" placeholder="you@example.com" [formControl]="email" />
  <span uiHint>We will never share it.</span>
  @if (email.invalid && email.touched) {
    <span uiError>Enter a valid email.</span>
  }
</ui-form-field>

<!-- Prefix and suffix sit inside the box -->
<ui-form-field>
  <label uiLabel>Amount</label>
  <span uiPrefix>$</span>
  <input uiInput inputmode="decimal" [formControl]="amount" />
  <span uiSuffix>USD</span>
</ui-form-field>

<ui-form-field>
  <label uiLabel>Notes</label>
  <textarea uiTextarea rows="3" [formControl]="notes"></textarea>
</ui-form-field>
```

An input also works on its own, without `ui-form-field`:

```html
<input uiInput size="sm" appearance="filled" placeholder="Search" />
```

The error text is yours: `uiError` is shown by the `@if`, so you decide when (usually "invalid and touched"). The control gets `aria-invalid="true"` while it is invalid and touched.

## API

### `input[uiInput]`, `textarea[uiTextarea]`

| Input        | Type                                   | Default                                                    | Description        |
| ------------ | -------------------------------------- | ---------------------------------------------------------- | ------------------ |
| `appearance` | `'outline' \| 'filled'`                | `provideUiConfig` `formField.appearance`, else `'outline'` | Look of the field. |
| `size`       | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `provideUiConfig` `defaultSize`, else `'md'`               | Size.              |

Both are form controls (`formControl`, `formControlName`, `ngModel`). Everything else is the native element: `type`, `placeholder`, `rows`, `disabled`, …

### `ui-form-field`

Takes no inputs: it reads what is projected into it.

| Projected content          | Use                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `label[uiLabel]`           | The label. Its `for` is set to the control's id.                                                                    |
| the control                | `input[uiInput]`, `textarea[uiTextarea]`, `ui-select`, `ui-otp-input`, `ui-editor`, `ui-slider`, `ui-range-slider`. |
| `[uiPrefix]`, `[uiSuffix]` | Content before / after the control, inside the box (with `uiInput`).                                                |
| `span[uiHint]`             | Help text, linked through `aria-describedby`.                                                                       |
| `span[uiError]`            | Error text, linked through `aria-describedby`.                                                                      |
