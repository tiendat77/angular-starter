import { cva } from '@libs/ui/core';

export const alertVariants = cva({
  base: 'alert alert-row',
  variants: {
    color: {
      neutral: 'alert-neutral',
      primary: 'alert-primary',
      info: 'alert-info',
      success: 'alert-success',
      warning: 'alert-warning',
      error: 'alert-error',
    },
    appearance: {
      soft: 'alert-soft',
      outline: 'alert-outline',
      dash: 'alert-dash',
      solid: 'alert-solid',
    },
    banner: { true: 'alert-banner', false: '' },
  },
  defaultVariants: { color: 'neutral', appearance: 'soft', banner: 'false' },
});
