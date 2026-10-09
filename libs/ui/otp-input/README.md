# OTP Input

A one-time-code input made of single-character slots, each a native `<input>`. Typing, paste and SMS autofill all work; the keyboard moves between slots. The value is one string of at most `length` characters, filled from the left with no gaps (`''` → `'12'` → `'123456'`). Works with `formControl`, `ngModel` and inside `ui-form-field`.

```ts
import { UiOtpInput } from '@libs/ui/otp-input';
```

## Usage

```html
<ui-form-field>
  <label uiLabel for="code">Verification code</label>
  <ui-otp-input inputId="code" [formControl]="code" (completed)="verify($event)" />
  <span uiHint>Enter the 6-digit code we sent you.</span>
</ui-form-field>

<!-- Without a form: a masked PIN of 4 characters -->
<ui-otp-input [length]="4" [mask]="true" ariaLabel="PIN" (completed)="pin = $event" />

<!-- Letters and digits, upper-cased -->
<ui-otp-input formatter="alphanumeric" [length]="8" />
<ui-otp-input [formatter]="upper" />   <!-- upper = (c) => c.toUpperCase() -->
```

Keyboard: Arrow Left / Right move between slots, Backspace deletes (and goes back), Delete removes in place. Pasting a code fills the slots from the one you are in.

## API

| Input            | Type                                                                | Default                                          | Description                                                                                                   |
| ---------------- | ------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `length`         | `number`                                                            | `6`                                              | Number of slots.                                                                                              |
| `formatter`      | `'numeric' \| 'alphanumeric' \| RegExp \| (char: string) => string` | `'numeric'`                                      | Which characters are accepted. A function may transform a character (upper-case) or return `''` to reject it. |
| `mask`           | `boolean \| string`                                                 | `false`                                          | Hides the characters: `true` shows `•`, a string shows its first character.                                   |
| `size`           | `'sm' \| 'md' \| 'lg'`                                              | the app's default size                           | Size of the slots.                                                                                            |
| `disabled`       | `boolean`                                                           | `false`                                          | Also set by the form.                                                                                         |
| `autoFocus`      | `boolean`                                                           | `false`                                          | Focuses the first empty slot once rendered.                                                                   |
| `inputMode`      | `string`                                                            | `numeric` for the numeric formatter, else `text` | Virtual keyboard hint.                                                                                        |
| `inputId`        | `string`                                                            | auto                                             | DOM id of the first slot, so a `<label for>` focuses the control.                                             |
| `ariaLabel`      | `string`                                                            | `'OTP verification code'`                        | Accessible name of the group (ignored when `ariaLabelledby` is set).                                          |
| `ariaLabelledby` | `string`                                                            | –                                                | Id of an element that labels the group.                                                                       |
| `slotLabel`      | `(index: number, length: number) => string`                         | `Digit i of n`                                   | Accessible name of each slot (`index` is 1-based). Use it to localise.                                        |

| Output      | Type     | Description                                                                  |
| ----------- | -------- | ---------------------------------------------------------------------------- |
| `completed` | `string` | The user's edit filled every slot. Not emitted when the form writes a value. |
