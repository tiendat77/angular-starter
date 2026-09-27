import { cva } from '@libs/ui/core';

export const avatarVariants = cva({
  base: 'avatar',
  variants: {
    size: {
      xs: 'avatar-xs',
      sm: 'avatar-sm',
      md: 'avatar-md',
      lg: 'avatar-lg',
      xl: 'avatar-xl',
    },
    shape: { circle: '', square: 'avatar-square' },
  },
  defaultVariants: { size: 'md', shape: 'circle' },
});
