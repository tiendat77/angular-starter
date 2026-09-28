import { describe, expect, it } from 'vitest';
import { menuItemVariants } from './menu.variants';

describe('menuItemVariants', () => {
  it('applies default classes (md size, not danger, not disabled)', () => {
    const classes = menuItemVariants();
    expect(classes).toContain('text-sm');
    expect(classes).toContain('text-gray-700');
    expect(classes).not.toContain('text-error');
  });

  it('applies sm and lg sizes', () => {
    expect(menuItemVariants({ size: 'sm' })).toContain('text-xs');
    expect(menuItemVariants({ size: 'lg' })).toContain('text-base');
  });

  it('applies danger styling', () => {
    const classes = menuItemVariants({ danger: true });
    expect(classes).toContain('text-error');
    expect(classes).toContain('hover:bg-error/10');
  });

  it('applies disabled styling', () => {
    const classes = menuItemVariants({ disabled: true });
    expect(classes).toContain('opacity-50');
    expect(classes).toContain('pointer-events-none');
  });
});
