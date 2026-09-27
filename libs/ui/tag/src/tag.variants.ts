import { cva } from '@libs/ui/core';

export const tagVariants = cva({
  base: 'tag',
  variants: {
    color: {
      neutral: 'tag-neutral',
      primary: 'tag-primary',
      info: 'tag-info',
      success: 'tag-success',
      warning: 'tag-warning',
      error: 'tag-error',
    },
    // soft is the base look of `tag`, so it needs no modifier
    appearance: { soft: '', outline: 'tag-outline', solid: 'tag-solid' },
    size: { sm: 'tag-sm', md: 'tag-md', lg: 'tag-lg' },
    checkable: { true: 'tag-checkable', false: '' },
    disabled: { true: 'tag-disabled', false: '' },
  },
  defaultVariants: {
    color: 'neutral',
    appearance: 'soft',
    size: 'md',
    checkable: 'false',
    disabled: 'false',
  },
});
