import { describe, expect, it } from 'vitest';
import { tooltipVariants } from './tooltip.variants';

describe('tooltipVariants', () => {
  it('applies default classes (neutral, md, non-interactive)', () => {
    const classes = tooltipVariants();
    expect(classes).toContain('tooltip');
    expect(classes).toContain('tooltip-neutral');
    expect(classes).toContain('tooltip-md');
    expect(classes).not.toContain('tooltip-interactive');
  });

  it('applies color variants', () => {
    expect(tooltipVariants({ color: 'primary' })).toContain('tooltip-primary');
    expect(tooltipVariants({ color: 'error' })).toContain('tooltip-error');
  });

  it('applies size and interactive modifiers', () => {
    expect(tooltipVariants({ size: 'sm', interactive: true })).toContain(
      'tooltip-sm tooltip-interactive'
    );
  });
});
