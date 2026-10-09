# Core

The shared base of `@libs/ui`: types, the `cva()` variant helper, `cn()`, the app-wide config, and the contract of a form control. The other entrypoints build on it.

```ts
import { cn, cva, provideUiConfig, UiFormFieldControl } from '@libs/ui/core';
import type { UiColor, UiSize, UiVariant } from '@libs/ui/core';
```

## Usage

### App-wide defaults

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideUiConfig({
      defaultSize: 'md',
      button: { defaultVariant: 'primary', defaultSize: 'md' },
      formField: { appearance: 'outline' },
    }),
  ],
};
```

### `cva()`: class variants

```ts
const chip = cva({
  base: 'inline-flex items-center rounded-full px-2',
  variants: {
    tone: { neutral: 'bg-muted text-foreground', danger: 'bg-error text-error-content' },
    size: { sm: 'text-xs', md: 'text-sm' },
  },
  defaultVariants: { tone: 'neutral', size: 'md' },
});

chip({ tone: 'danger' }); // 'inline-flex … bg-error text-error-content text-sm'
chip({ size: 'sm' }, 'ml-2'); // an extra class goes last

// A boolean variant uses the keys 'true' and 'false' (strings), e.g. chip({ active: 'true' })
```

### `cn()`: merge classes

`cn('px-2', cond && 'px-4', 'text-sm')` joins the strings that are truthy (it ignores `false`, `null` and `undefined`). It does not resolve conflicting Tailwind classes: both `px-2` and `px-4` would be kept, so avoid passing conflicting utilities.

### A form control for `ui-form-field`

Extend `UiFormFieldControl` and provide it, and `ui-form-field` finds your control: it labels it, and passes the ids of the hint and the error.

```ts
@Component({
  selector: 'app-rating',
  providers: [{ provide: UiFormFieldControl, useExisting: forwardRef(() => Rating) }],
})
export class Rating extends UiFormFieldControl<number> {
  /* $value, $disabled, $focused, $invalid, id, and optionally ariaTarget / setDescribedByIds */
}
```

## API

| Export               | What it is                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `UiColor`            | `'neutral' \| 'primary' \| 'info' \| 'success' \| 'warning' \| 'error'`                                            |
| `UiSize`             | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                                             |
| `UiVariant`          | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'`                                                     |
| `cva(config)`        | Builds a function from `{ base, variants, defaultVariants }` that returns a class string.                          |
| `cn(...classes)`     | Joins the truthy class strings (no conflict resolution).                                                           |
| `UiConfig`           | `{ defaultSize?, button?: { defaultVariant?, defaultSize? }, formField?: { appearance?: 'outline' \| 'filled' } }` |
| `provideUiConfig(c)` | Provides the config (`UI_CONFIG`).                                                                                 |
| `UiFormFieldControl` | Abstract class of a control that `ui-form-field` can wrap (below).                                                 |

### `UiFormFieldControl<T>`

| Member                    | Description                                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `$value`                  | `Signal<T \| null>`, the current value.                                                                                       |
| `$disabled`               | `Signal<boolean>`.                                                                                                            |
| `$focused`                | `Signal<boolean>`.                                                                                                            |
| `$invalid`                | `Signal<boolean>`: the control is invalid and was touched.                                                                    |
| `id`                      | `string`, the DOM id the `<label for>` points to.                                                                             |
| `ariaTarget?`             | `Signal<HTMLElement \| undefined>`: the element that gets `aria-invalid` / `aria-describedby`. Omit it when that is the host. |
| `setDescribedByIds?(ids)` | Receives the ids of the hint and the error, to merge them with your own.                                                      |
