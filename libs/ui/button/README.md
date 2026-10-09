# Button

A native `<button>` or `<a>` with the design system's look. Disabled and loading states are accessible on both: links have no `disabled` property, so the click is blocked for them.

```ts
import { UiButtonComponent, UiButtonGroupComponent } from '@libs/ui/button';
```

## Usage

```html
<button uiButton>Save</button>
<button uiButton variant="outline" size="sm">Cancel</button>
<button uiButton variant="danger" [loading]="deleting()" (click)="remove()">Delete</button>

<!-- A link that looks like a button -->
<a uiButton variant="ghost" href="/docs">Docs</a>

<!-- Icon button: give it an accessible name -->
<button uiButton size="icon" variant="ghost" aria-label="Settings"><svg>…</svg></button>

<button uiButton fullWidth>Continue</button>

<ui-button-group>
  <button uiButton variant="outline">One</button>
  <button uiButton variant="outline">Two</button>
</ui-button-group>
```

## API

### `button[uiButton]`, `a[uiButton]`

| Input       | Type                                                           | Default     | Description                                                               |
| ----------- | -------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------- |
| `variant`   | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Look. The default can be set app-wide with `provideUiConfig({ button })`. |
| `size`      | `'sm' \| 'md' \| 'lg' \| 'icon'`                               | `'md'`      | Size; `icon` is a square button for an icon alone.                        |
| `loading`   | `boolean`                                                      | `false`     | Shows a spinner and treats the button as disabled.                        |
| `disabled`  | `boolean`                                                      | `false`     | Disabled (also blocks the click of an `<a>`).                             |
| `fullWidth` | `boolean`                                                      | `false`     | Fills the width of its container.                                         |

### `ui-button-group`

Lays out the `uiButton`s inside it in a row with consistent spacing. It has no inputs.
