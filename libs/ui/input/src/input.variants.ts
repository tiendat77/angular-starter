import { cva } from '@libs/ui/core';

/**
 * Visual treatment of a form control's boundary.
 *
 * Mirrors `UiConfig.formField.appearance` in `@libs/ui/core` so a global
 * default can be set once via `provideUiConfig(...)`.
 */
export type UiFormFieldAppearance = 'outline' | 'filled';

/**
 * Maps inputs onto the `input` CSS utilities (`@libs/ui/styles`), so
 * `class="input input-md"` and `uiInput` render identically.
 *
 * Also used by `UiFormFieldComponent` for the box it draws around a `uiInput`
 * plus `uiPrefix`/`uiSuffix` (the utility styles a nested `<input>` as bare).
 */
export const inputVariants = cva({
  base: 'input w-full',
  variants: {
    appearance: {
      outline: '',
      filled: 'input-filled',
    },
    size: {
      xs: 'input-xs',
      sm: 'input-sm',
      md: 'input-md',
      lg: 'input-lg',
      xl: 'input-xl',
    },
  },
  defaultVariants: {
    appearance: 'outline',
    size: 'md',
  },
});

/** Maps inputs onto the `textarea` CSS utilities (`@libs/ui/styles`). */
export const textareaVariants = cva({
  base: 'textarea w-full resize-y',
  variants: {
    appearance: {
      outline: '',
      filled: 'textarea-filled',
    },
    size: {
      xs: 'textarea-xs',
      sm: 'textarea-sm',
      md: 'textarea-md',
      lg: 'textarea-lg',
      xl: 'textarea-xl',
    },
  },
  defaultVariants: {
    appearance: 'outline',
    size: 'md',
  },
});
