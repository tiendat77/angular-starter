import { cva } from '@libs/ui/core';

/**
 * Visual treatment of a form control's boundary.
 *
 * Mirrors `UiConfig.formField.appearance` in `@libs/ui/core` so a global
 * default can be set once via `provideUiConfig(...)`.
 */
export type UiFormFieldAppearance = 'outline' | 'filled';

const sharedBase =
  'flex w-full min-w-0 text-foreground transition-colors placeholder:text-foreground/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error aria-invalid:focus-visible:outline-error';

const sharedAppearance = {
  outline: 'border border-border bg-background',
  filled: 'border border-transparent bg-muted',
};

export const inputVariants = cva({
  base: `${sharedBase} rounded-lg`,
  variants: {
    appearance: sharedAppearance,
    size: {
      xs: 'h-7 px-2 text-xs rounded-md',
      sm: 'h-8 px-2.5 text-xs rounded-md',
      md: 'h-10 px-3 text-sm',
      lg: 'h-12 px-4 text-base',
      xl: 'h-14 px-5 text-lg rounded-xl',
    },
  },
  defaultVariants: {
    appearance: 'outline',
    size: 'md',
  },
});

export const textareaVariants = cva({
  base: `${sharedBase} resize-y rounded-lg`,
  variants: {
    appearance: sharedAppearance,
    size: {
      xs: 'min-h-12 px-2 py-1 text-xs rounded-md',
      sm: 'min-h-16 px-2.5 py-1.5 text-xs rounded-md',
      md: 'min-h-24 px-3 py-2 text-sm',
      lg: 'min-h-32 px-4 py-2.5 text-base',
      xl: 'min-h-40 px-5 py-3 text-lg rounded-xl',
    },
  },
  defaultVariants: {
    appearance: 'outline',
    size: 'md',
  },
});
