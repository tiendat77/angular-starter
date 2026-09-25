import { describe, expect, it } from 'vitest';
import { cn } from './cn';
import { cva } from './cva';

describe('cva utility', () => {
  it('should generate class strings with default variants', () => {
    const buttonVariants = cva({
      base: 'btn',
      variants: {
        variant: { primary: 'btn-primary', secondary: 'btn-secondary' },
        size: { sm: 'text-sm', md: 'text-base' },
      },
      defaultVariants: { variant: 'primary', size: 'md' },
    });

    expect(buttonVariants()).toBe('btn btn-primary text-base');
    expect(buttonVariants({ variant: 'secondary' })).toBe('btn btn-secondary text-base');
    expect(buttonVariants({ size: 'sm' }, 'custom-class')).toBe(
      'btn btn-primary text-sm custom-class'
    );
  });
});

describe('cn utility', () => {
  it('should merge class names and omit falsy values', () => {
    expect(cn('base', false && 'hidden', undefined, 'active')).toBe('base active');
  });
});
