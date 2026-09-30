import { cva } from '@libs/ui/core';

/** Root `<label>` shared by checkbox and switch: layout, label typography and disabled state. */
export const checkboxVariants = cva({
  base: 'relative flex items-start gap-2 select-none',
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    },
    disabled: {
      true: 'cursor-not-allowed text-muted-foreground',
      false: 'cursor-pointer text-foreground',
    },
  },
  defaultVariants: {
    size: 'md',
    disabled: 'false',
  },
});

/** Maps inputs onto the `checkbox` CSS utilities (`@libs/ui/styles`). */
export const checkboxBoxVariants = cva({
  base: 'checkbox',
  variants: {
    size: {
      xs: 'checkbox-xs',
      sm: 'checkbox-sm',
      md: 'checkbox-md',
      lg: 'checkbox-lg',
      xl: 'checkbox-xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

/** Maps inputs onto the `toggle` CSS utilities (`@libs/ui/styles`). */
export const switchTrackVariants = cva({
  base: 'toggle',
  variants: {
    size: {
      xs: 'toggle-xs',
      sm: 'toggle-sm',
      md: 'toggle-md',
      lg: 'toggle-lg',
      xl: 'toggle-xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

/** Wrapper of a switch with its label inside the track; carries the size so the label scales with it. */
export const switchLabeledVariants = cva({
  base: 'toggle-inside',
  variants: {
    size: {
      xs: 'toggle-xs',
      sm: 'toggle-sm',
      md: 'toggle-md',
      lg: 'toggle-lg',
      xl: 'toggle-xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
