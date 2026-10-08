import { cva } from '@libs/ui/core';

/** Maps the inputs onto the `slider-root` CSS utilities (`@libs/ui/styles`), for both components. */
export const sliderVariants = cva({
  base: 'slider-root',
  variants: {
    size: {
      xs: 'slider-xs',
      sm: 'slider-sm',
      md: 'slider-md',
      lg: 'slider-lg',
    },
    color: {
      neutral: 'slider-neutral',
      primary: 'slider-primary',
      secondary: 'slider-secondary',
      info: 'slider-info',
      success: 'slider-success',
      warning: 'slider-warning',
      error: 'slider-error',
    },
    ticks: {
      true: 'slider-ticked',
      false: '',
    },
    valued: {
      true: 'slider-valued',
      false: '',
    },
    disabled: {
      true: 'slider-disabled',
      false: '',
    },
    invalid: {
      true: 'slider-invalid',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
    ticks: 'false',
    valued: 'false',
    disabled: 'false',
    invalid: 'false',
  },
});
