import { cva } from '@libs/ui/core';

export const cardVariants = cva({
  base: 'card',
  variants: {
    appearance: { outline: 'card-outline', elevated: 'card-elevated', filled: 'card-filled' },
    padding: { none: 'card-p-none', sm: 'card-p-sm', md: 'card-p-md', lg: 'card-p-lg' },
    interactive: { true: 'card-interactive', false: '' },
  },
  defaultVariants: { appearance: 'outline', padding: 'md', interactive: 'false' },
});
