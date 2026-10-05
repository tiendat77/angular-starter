import { cva } from '@libs/ui/core';

/** Maps the size input onto the `input` CSS utilities (`@libs/ui/styles`) plus a fixed slot width. */
export const otpSlotVariants = cva({
  base: 'input px-0 text-center font-medium tabular-nums',
  variants: {
    size: {
      sm: 'input-sm w-8',
      md: 'input-md w-10',
      lg: 'input-lg w-12',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
