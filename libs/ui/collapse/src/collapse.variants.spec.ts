import { describe, expect, it } from 'vitest';
import { collapsePanelVariants, collapseVariants } from './collapse.variants';

describe('Collapse Variants', () => {
  it('should generate bordered variant classes by default', () => {
    const classes = collapseVariants({ variant: 'bordered' });
    expect(classes).toContain('border');
    expect(classes).toContain('rounded-lg');
  });

  it('should generate ghost variant classes', () => {
    const classes = collapseVariants({ variant: 'ghost' });
    expect(classes).toContain('bg-transparent');
    expect(classes).not.toContain('border');
  });

  it('should position expand icon on left or right', () => {
    expect(collapsePanelVariants({ iconPosition: 'left' })).toContain('flex-row');
    expect(collapsePanelVariants({ iconPosition: 'right' })).toContain('flex-row-reverse');
  });
});
