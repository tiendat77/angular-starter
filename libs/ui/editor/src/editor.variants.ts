import { cva } from '@libs/ui/core';

/** The frame around the toolbar and the writing area (see `editor-frame` in `libs/ui/styles`). */
export const editorVariants = cva({
  base: 'editor-frame',
  variants: {
    invalid: {
      true: 'editor-invalid',
      false: '',
    },
    disabled: {
      true: 'editor-disabled',
      false: '',
    },
  },
  defaultVariants: {
    invalid: 'false',
    disabled: 'false',
  },
});
